"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchModelCommand = void 0;
const commander_1 = require("commander");
const ModelSwitcher_1 = require("@services/ModelSwitcher");
const ConfigManager_1 = require("@services/ConfigManager");
const ProjectDetector_1 = require("@services/ProjectDetector");
const chalk_1 = __importDefault(require("chalk"));
class SwitchModelCommand {
    constructor() {
        this.configManager = new ConfigManager_1.ConfigManager();
        this.modelSwitcher = new ModelSwitcher_1.ModelSwitcher(this.configManager);
        this.projectDetector = new ProjectDetector_1.ProjectDetector();
    }
    create() {
        const command = new commander_1.Command('switch-model');
        command
            .description('Switch AI model without losing project progress')
            .argument('<target>', 'Target AI model (claude or gemini)')
            .option('--backup', 'Create backup before switching (default: true)', true)
            .option('--dry-run', 'Show what would be changed without making changes', false)
            .option('--force', 'Force switch even if validation fails', false)
            .option('--no-validate', 'Skip validation checks', false)
            .action(async (target, options) => {
            await this.execute(target, options);
        });
        return command;
    }
    async execute(target, options) {
        try {
            // Validate target model
            if (!['claude', 'gemini'].includes(target)) {
                console.error(chalk_1.default.red(`Error: Invalid target model '${target}'. Must be 'claude' or 'gemini'.`));
                process.exit(1);
            }
            const targetModel = target;
            console.log(chalk_1.default.blue('🔄 Switching AI Model...'));
            console.log(chalk_1.default.gray(`Target model: ${targetModel}`));
            // Detect current project
            const detection = await this.projectDetector.detectProject();
            if (!detection.found || !detection.config) {
                console.error(chalk_1.default.red('❌ No spec-kit project found in current directory'));
                console.error(chalk_1.default.gray('Run "specify detect-project" for more information'));
                process.exit(1);
            }
            const currentConfig = detection.config;
            // Check if already using target model
            if (currentConfig.aiModel === targetModel) {
                console.log(chalk_1.default.yellow(`⚠️  Project is already using ${targetModel}`));
                return;
            }
            console.log(chalk_1.default.gray(`Current model: ${currentConfig.aiModel}`));
            // Perform validation unless disabled
            if (options.validate !== false && !options.force) {
                console.log(chalk_1.default.blue('🔍 Validating project...'));
                const validation = await this.configManager.validateConfig(currentConfig.configPath);
                if (!validation.valid && !options.force) {
                    console.error(chalk_1.default.red('❌ Project validation failed:'));
                    validation.errors.forEach(error => {
                        console.error(chalk_1.default.red(`  • ${error}`));
                    });
                    if (validation.warnings.length > 0) {
                        console.warn(chalk_1.default.yellow('⚠️  Warnings:'));
                        validation.warnings.forEach(warning => {
                            console.warn(chalk_1.default.yellow(`  • ${warning}`));
                        });
                    }
                    console.error(chalk_1.default.gray('Use --force to proceed anyway'));
                    process.exit(1);
                }
                if (validation.warnings.length > 0) {
                    console.warn(chalk_1.default.yellow('⚠️  Warnings found:'));
                    validation.warnings.forEach(warning => {
                        console.warn(chalk_1.default.yellow(`  • ${warning}`));
                    });
                }
            }
            if (options.dryRun) {
                console.log(chalk_1.default.cyan('🏃 Dry run mode - no changes will be made'));
            }
            // Perform the switch
            console.log(chalk_1.default.blue('🚀 Starting model migration...'));
            const result = await this.modelSwitcher.switchModel(currentConfig, {
                targetModel,
                createBackup: options.backup,
                dryRun: options.dryRun,
                force: options.force,
            });
            if (!result.success) {
                console.error(chalk_1.default.red(`❌ Migration failed: ${result.errorMessage}`));
                if (result.backupPath) {
                    console.error(chalk_1.default.gray(`Backup available at: ${result.backupPath}`));
                }
                process.exit(1);
            }
            // Show results
            if (options.dryRun) {
                console.log(chalk_1.default.green('✅ Dry run completed successfully'));
                console.log(chalk_1.default.gray('No actual changes were made to your project'));
            }
            else {
                console.log(chalk_1.default.green(`✅ Successfully switched to ${targetModel}!`));
                console.log(chalk_1.default.gray(`Migration ID: ${result.migrationId}`));
                if (result.backupPath) {
                    console.log(chalk_1.default.gray(`Backup created: ${result.backupPath}`));
                }
            }
            // Show warnings
            if (result.warnings.length > 0) {
                console.warn(chalk_1.default.yellow('⚠️  Warnings:'));
                result.warnings.forEach(warning => {
                    console.warn(chalk_1.default.yellow(`  • ${warning}`));
                });
            }
            // Show next steps
            if (!options.dryRun) {
                console.log(chalk_1.default.blue('\n📋 Next steps:'));
                console.log(chalk_1.default.gray('  • Test your project to ensure everything works correctly'));
                console.log(chalk_1.default.gray('  • Update any model-specific configurations if needed'));
                console.log(chalk_1.default.gray(`  • Use "specify list-models" to see ${targetModel} capabilities`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Unexpected error: ${error}`));
            process.exit(1);
        }
    }
    async validateArgs(target) {
        const errors = [];
        const suggestions = [];
        if (!target) {
            errors.push('Target model is required');
            suggestions.push('Specify target model: specify switch-model <claude|gemini>');
        }
        else if (!['claude', 'gemini'].includes(target)) {
            errors.push(`Invalid target model: ${target}`);
            suggestions.push('Valid models are: claude, gemini');
        }
        return {
            valid: errors.length === 0,
            errors,
            suggestions,
        };
    }
    getUsageExamples() {
        return [
            'specify switch-model claude',
            'specify switch-model gemini --dry-run',
            'specify switch-model claude --force --no-backup',
            'specify switch-model gemini --validate',
        ];
    }
}
exports.SwitchModelCommand = SwitchModelCommand;
//# sourceMappingURL=SwitchModelCommand.js.map