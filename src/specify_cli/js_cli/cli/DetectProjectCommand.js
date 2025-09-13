"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetectProjectCommand = void 0;
const commander_1 = require("commander");
const ProjectDetector_1 = require("../services/ProjectDetector");
const chalk_1 = __importDefault(require("chalk"));
const path = __importStar(require("path"));
class DetectProjectCommand {
    constructor() {
        this.projectDetector = new ProjectDetector_1.ProjectDetector();
    }
    create() {
        const command = new commander_1.Command('detect-project');
        command
            .description('Auto-detect existing spec-kit projects and validate configuration')
            .option('--validate', 'Perform detailed validation of project configuration', true)
            .option('--auto-fix', 'Automatically fix detected issues when possible', false)
            .option('--repair', 'Attempt to repair broken project configuration', false)
            .option('-v, --verbose', 'Show detailed information about detection process', false)
            .option('-d, --depth <number>', 'Search depth for project detection (default: 5)', '5')
            .option('--include-drafts', 'Include draft specifications in validation', false)
            .action(async (options) => {
            await this.execute(options);
        });
        return command;
    }
    async execute(options) {
        try {
            const searchDepth = options.depth ? parseInt(options.depth.toString()) : 5;
            console.log(chalk_1.default.blue('🔍 Detecting spec-kit projects...'));
            if (options.verbose) {
                console.log(chalk_1.default.gray(`Search path: ${process.cwd()}`));
                console.log(chalk_1.default.gray(`Search depth: ${searchDepth}`));
                console.log(chalk_1.default.gray(`Auto-fix enabled: ${options.autoFix ? 'Yes' : 'No'}`));
            }
            // Detect project
            const result = await this.projectDetector.detectProject(process.cwd(), {
                searchDepth,
                validateConfig: options.validate,
                autoFix: options.autoFix,
                includeDrafts: options.includeDrafts,
            });
            // Handle project not found
            if (!result.found) {
                console.log(chalk_1.default.yellow('❌ No spec-kit project detected'));
                if (result.issues.length > 0) {
                    console.log(chalk_1.default.gray('\nDetection issues:'));
                    this.displayIssues(result.issues);
                }
                if (result.suggestions.length > 0) {
                    console.log(chalk_1.default.blue('\n💡 Suggestions:'));
                    result.suggestions.forEach(suggestion => {
                        console.log(chalk_1.default.gray(`  • ${suggestion}`));
                    });
                }
                return;
            }
            // Project found - display results
            console.log(chalk_1.default.green('✅ Spec-kit project detected!'));
            console.log(chalk_1.default.gray(`Project path: ${result.projectPath}`));
            if (result.config) {
                console.log(chalk_1.default.blue('\n📋 Project Information:'));
                console.log(`  Name: ${chalk_1.default.white(result.config.name)}`);
                console.log(`  AI Model: ${chalk_1.default.white(result.config.aiModel)}`);
                console.log(`  Version: ${chalk_1.default.white(result.config.version)}`);
                console.log(`  Initialized: ${result.config.isInitialized ? chalk_1.default.green('Yes') : chalk_1.default.yellow('No')}`);
                console.log(`  Spec Directory: ${chalk_1.default.gray(path.relative(process.cwd(), result.config.specDirectory))}`);
                if (result.config.migrationHistory.length > 0) {
                    console.log(`  Migrations: ${chalk_1.default.white(result.config.migrationHistory.length)} completed`);
                    if (options.verbose) {
                        console.log(chalk_1.default.blue('\n🔄 Migration History:'));
                        result.config.migrationHistory.slice(-3).forEach(migration => {
                            const status = migration.success ? chalk_1.default.green('✅') : chalk_1.default.red('❌');
                            console.log(`    ${status} ${migration.fromModel} → ${migration.toModel} (${new Date(migration.timestamp).toLocaleDateString()})`);
                        });
                    }
                }
            }
            // Display issues if any
            if (result.issues.length > 0) {
                const errors = result.issues.filter(i => i.type === 'error');
                const warnings = result.issues.filter(i => i.type === 'warning');
                const info = result.issues.filter(i => i.type === 'info');
                if (errors.length > 0) {
                    console.log(chalk_1.default.red('\n❌ Errors found:'));
                    this.displayIssues(errors);
                }
                if (warnings.length > 0) {
                    console.log(chalk_1.default.yellow('\n⚠️  Warnings:'));
                    this.displayIssues(warnings);
                }
                if (info.length > 0 && options.verbose) {
                    console.log(chalk_1.default.blue('\nℹ️  Information:'));
                    this.displayIssues(info);
                }
                // Show repair option if needed
                if ((errors.length > 0 || warnings.length > 0) && !options.repair) {
                    const fixableCount = result.issues.filter(i => i.fixable).length;
                    if (fixableCount > 0) {
                        console.log(chalk_1.default.blue(`\n🔧 ${fixableCount} issue(s) can be automatically fixed`));
                        console.log(chalk_1.default.gray('Run with --repair to attempt automatic repairs'));
                    }
                }
            }
            // Display suggestions
            if (result.suggestions.length > 0) {
                console.log(chalk_1.default.blue('\n💡 Suggestions:'));
                result.suggestions.forEach(suggestion => {
                    console.log(chalk_1.default.gray(`  • ${suggestion}`));
                });
            }
            // Perform repair if requested
            if (options.repair && result.issues.some(i => i.fixable)) {
                console.log(chalk_1.default.blue('\n🔧 Attempting to repair project...'));
                const repairResult = await this.projectDetector.repairProject(result.projectPath, result.config);
                if (repairResult.found) {
                    console.log(chalk_1.default.green('✅ Project repair completed successfully'));
                    if (repairResult.suggestions.length > 0) {
                        console.log(chalk_1.default.blue('\nRepair actions taken:'));
                        repairResult.suggestions.forEach(suggestion => {
                            console.log(chalk_1.default.gray(`  • ${suggestion}`));
                        });
                    }
                    if (repairResult.issues.length > 0) {
                        console.log(chalk_1.default.yellow('\nRemaining issues after repair:'));
                        this.displayIssues(repairResult.issues);
                    }
                }
                else {
                    console.error(chalk_1.default.red('❌ Project repair failed'));
                    if (repairResult.issues.length > 0) {
                        this.displayIssues(repairResult.issues);
                    }
                }
            }
            // Show next steps
            if (result.config && result.issues.length === 0) {
                console.log(chalk_1.default.blue('\n🚀 Next steps:'));
                console.log(chalk_1.default.gray('  • Use "specify list-models" to see available AI models'));
                console.log(chalk_1.default.gray('  • Use "specify switch-model <model>" to change AI models'));
                console.log(chalk_1.default.gray('  • Use "specify track-tasks enable" for task tracking UI'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Detection failed: ${error}`));
            process.exit(1);
        }
    }
    displayIssues(issues) {
        issues.forEach(issue => {
            const icon = this.getIssueIcon(issue.type);
            const color = this.getIssueColor(issue.type);
            console.log(color(`  ${icon} ${issue.message}`));
            if (issue.path) {
                console.log(chalk_1.default.gray(`    Path: ${issue.path}`));
            }
            if (issue.fixable) {
                console.log(chalk_1.default.gray(`    Fixable: Yes`));
            }
        });
    }
    getIssueIcon(type) {
        switch (type) {
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '•';
        }
    }
    getIssueColor(type) {
        switch (type) {
            case 'error': return chalk_1.default.red;
            case 'warning': return chalk_1.default.yellow;
            case 'info': return chalk_1.default.blue;
            default: return chalk_1.default.gray;
        }
    }
    async validateCurrentProject() {
        try {
            const result = await this.projectDetector.detectProject(process.cwd(), {
                validateConfig: true,
                autoFix: false,
            });
            return {
                valid: result.found && result.issues.filter(i => i.type === 'error').length === 0,
                projectPath: result.projectPath,
                config: result.config,
                issues: result.issues,
            };
        }
        catch (error) {
            return {
                valid: false,
                issues: [{
                        type: 'error',
                        message: `Validation failed: ${error}`,
                        fixable: false,
                    }],
            };
        }
    }
    getUsageExamples() {
        return [
            'specify detect-project',
            'specify detect-project --verbose',
            'specify detect-project --repair',
            'specify detect-project --auto-fix --include-drafts',
            'specify detect-project --depth 10',
        ];
    }
    async searchProjectsInDirectory(directory, maxDepth = 3) {
        const projects = [];
        try {
            const result = await this.projectDetector.detectProject(directory, {
                searchDepth: maxDepth,
                validateConfig: true,
            });
            if (result.found && result.projectPath) {
                projects.push({
                    path: result.projectPath,
                    config: result.config,
                    valid: result.issues.filter(i => i.type === 'error').length === 0,
                });
            }
        }
        catch (error) {
            // Continue searching even if one directory fails
        }
        return {
            projects,
            totalFound: projects.length,
        };
    }
}
exports.DetectProjectCommand = DetectProjectCommand;
//# sourceMappingURL=DetectProjectCommand.js.map