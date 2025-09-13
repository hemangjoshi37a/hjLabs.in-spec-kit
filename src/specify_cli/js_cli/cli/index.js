#!/usr/bin/env node
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
exports.SpecifyCLI = void 0;
const commander_1 = require("commander");
const SwitchModelCommand_1 = require("./SwitchModelCommand");
const ListModelsCommand_1 = require("./ListModelsCommand");
const DetectProjectCommand_1 = require("./DetectProjectCommand");
const ResetProjectCommand_1 = require("./ResetProjectCommand");
const TrackTasksCommand_1 = require("./TrackTasksCommand");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class SpecifyCLI {
    constructor() {
        this.program = new commander_1.Command();
        this.version = this.loadVersion();
        this.setupProgram();
        this.setupCommands();
        this.setupGlobalOptions();
        this.setupErrorHandling();
    }
    loadVersion() {
        try {
            const packageJsonPath = path.join(__dirname, '../../package.json');
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            return packageJson.version || '0.1.0';
        }
        catch (error) {
            return '0.1.0';
        }
    }
    setupProgram() {
        this.program
            .name('specify')
            .description('AI Model Switching and Task Tracking CLI for Spec-Driven Development')
            .version(this.version, '-v, --version', 'Output the current version')
            .helpOption('-h, --help', 'Display help for command');
    }
    setupCommands() {
        // Switch Model Command
        const switchModelCmd = new SwitchModelCommand_1.SwitchModelCommand();
        this.program.addCommand(switchModelCmd.create());
        // List Models Command
        const listModelsCmd = new ListModelsCommand_1.ListModelsCommand();
        this.program.addCommand(listModelsCmd.create());
        // Detect Project Command
        const detectProjectCmd = new DetectProjectCommand_1.DetectProjectCommand();
        this.program.addCommand(detectProjectCmd.create());
        // Reset Project Command
        const resetProjectCmd = new ResetProjectCommand_1.ResetProjectCommand();
        this.program.addCommand(resetProjectCmd.create());
        // Track Tasks Command
        const trackTasksCmd = new TrackTasksCommand_1.TrackTasksCommand();
        this.program.addCommand(trackTasksCmd.create());
        // Add aliases for common commands
        this.program
            .command('switch <target>')
            .description('Alias for switch-model command')
            .action((target, options) => {
            const switchCmd = new SwitchModelCommand_1.SwitchModelCommand();
            switchCmd.execute(target, options);
        });
        this.program
            .command('models')
            .description('Alias for list-models command')
            .action((options) => {
            const listCmd = new ListModelsCommand_1.ListModelsCommand();
            listCmd.execute(options);
        });
        this.program
            .command('detect')
            .description('Alias for detect-project command')
            .action((options) => {
            const detectCmd = new DetectProjectCommand_1.DetectProjectCommand();
            detectCmd.execute(options);
        });
        this.program
            .command('status')
            .description('Show project and task status')
            .action(async () => {
            await this.showStatus();
        });
        this.program
            .command('info')
            .description('Show detailed project information')
            .action(async () => {
            await this.showInfo();
        });
    }
    setupGlobalOptions() {
        this.program
            .option('--debug', 'Enable debug output', false)
            .option('--no-color', 'Disable colored output', false)
            .option('--config <path>', 'Path to configuration file')
            .option('--quiet', 'Suppress non-error output', false);
    }
    setupErrorHandling() {
        this.program.exitOverride();
        process.on('unhandledRejection', (error) => {
            console.error(chalk_1.default.red('Unhandled promise rejection:'), error);
            process.exit(1);
        });
        process.on('uncaughtException', (error) => {
            console.error(chalk_1.default.red('Uncaught exception:'), error);
            process.exit(1);
        });
        // Handle SIGINT (Ctrl+C) gracefully
        process.on('SIGINT', () => {
            console.log(chalk_1.default.yellow('\n👋 Goodbye!'));
            process.exit(0);
        });
    }
    async showStatus() {
        try {
            console.log(chalk_1.default.blue('📊 Specify Project Status\n'));
            // Detect project
            const { DetectProjectCommand } = await Promise.resolve().then(() => __importStar(require('./DetectProjectCommand')));
            const detectCmd = new DetectProjectCommand();
            const validation = await detectCmd.validateCurrentProject();
            if (!validation.valid) {
                console.log(chalk_1.default.yellow('⚠️  No valid spec-kit project found'));
                console.log(chalk_1.default.gray('Run "specify detect-project" for more details'));
                return;
            }
            const config = validation.config;
            // Project info
            console.log(chalk_1.default.white('📋 Project Information:'));
            console.log(`  Name: ${chalk_1.default.cyan(config.name)}`);
            console.log(`  AI Model: ${chalk_1.default.cyan(config.aiModel)}`);
            console.log(`  Version: ${chalk_1.default.gray(config.version)}`);
            console.log(`  Path: ${chalk_1.default.gray(validation.projectPath)}`);
            // Task status
            try {
                const { TaskTracker } = await Promise.resolve().then(() => __importStar(require('@services/TaskTracker')));
                const taskTracker = new TaskTracker(config);
                await taskTracker.initialize();
                const stats = taskTracker.getTaskStats();
                console.log(chalk_1.default.white('\n📈 Task Status:'));
                console.log(`  Total: ${chalk_1.default.cyan(stats.total)}`);
                console.log(`  Completed: ${chalk_1.default.green(stats.completed)} (${stats.percentComplete}%)`);
                console.log(`  In Progress: ${chalk_1.default.yellow(stats.inProgress)}`);
                console.log(`  Pending: ${chalk_1.default.gray(stats.pending)}`);
                if (stats.failed > 0) {
                    console.log(`  Failed: ${chalk_1.default.red(stats.failed)}`);
                }
                // Progress bar
                const progressBar = this.createProgressBar(stats.percentComplete);
                console.log(`\n  ${progressBar}`);
            }
            catch (error) {
                console.log(chalk_1.default.gray('\n📈 Task Status: No task data available'));
            }
            // Model compatibility
            const { AIModelSettingsProvider } = await Promise.resolve().then(() => __importStar(require('@models/AIModelSettings')));
            const modelSettings = AIModelSettingsProvider.getSettings(config.aiModel);
            if (modelSettings) {
                console.log(chalk_1.default.white('\n🤖 AI Model Status:'));
                console.log(`  Current: ${chalk_1.default.cyan(modelSettings.modelType)} v${modelSettings.version}`);
                console.log(`  Max Tokens: ${chalk_1.default.gray(modelSettings.capabilities.maxTokens.toLocaleString())}`);
                console.log(`  Features: ${chalk_1.default.gray(modelSettings.capabilities.features.length)} available`);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Failed to get status: ${error}`));
        }
    }
    async showInfo() {
        try {
            console.log(chalk_1.default.blue(`🔧 Specify CLI v${this.version}\n`));
            console.log(chalk_1.default.white('📦 Available Commands:'));
            console.log('  switch-model <target>  Switch AI model (claude/gemini)');
            console.log('  list-models           Show available AI models');
            console.log('  detect-project        Auto-detect and validate project');
            console.log('  reset-project         Clean project reset with backup');
            console.log('  track-tasks <action>  Manage task tracking UI');
            console.log('');
            console.log(chalk_1.default.white('🔗 Aliases:'));
            console.log('  switch <target>       Alias for switch-model');
            console.log('  models               Alias for list-models');
            console.log('  detect               Alias for detect-project');
            console.log('  status               Show project and task status');
            console.log('  info                 Show this information');
            console.log('');
            console.log(chalk_1.default.white('🎯 Examples:'));
            console.log('  specify switch claude');
            console.log('  specify models --details');
            console.log('  specify detect --repair');
            console.log('  specify track-tasks enable --sidebar');
            console.log('');
            console.log(chalk_1.default.white('🏗️  Architecture:'));
            console.log('  • Library-first design with CLI wrappers');
            console.log('  • Real-time task tracking with terminal UI');
            console.log('  • Automatic project detection and validation');
            console.log('  • AI model migration with rollback support');
            console.log('');
            console.log(chalk_1.default.gray('Use --help with any command for detailed usage information'));
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Failed to show info: ${error}`));
        }
    }
    createProgressBar(percentage, width = 20) {
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        const bar = chalk_1.default.green('█').repeat(filled) + chalk_1.default.gray('░').repeat(empty);
        return `${bar} ${percentage}%`;
    }
    async run(args = process.argv) {
        try {
            // Check for no arguments (show help)
            if (args.length <= 2) {
                this.program.outputHelp();
                return;
            }
            // Parse and execute
            await this.program.parseAsync(args);
        }
        catch (error) {
            // Handle Commander.js errors
            if (error.code === 'commander.invalidArgument') {
                console.error(chalk_1.default.red(`❌ Invalid argument: ${error.message}`));
                console.error(chalk_1.default.gray('Use --help for usage information'));
            }
            else if (error.code === 'commander.unknownCommand') {
                console.error(chalk_1.default.red(`❌ Unknown command: ${error.message}`));
                console.error(chalk_1.default.gray('Use --help to see available commands'));
            }
            else if (error.code === 'commander.help') {
                // Help was requested, exit normally
                return;
            }
            else if (error.code === 'commander.version') {
                // Version was requested, exit normally
                return;
            }
            else {
                console.error(chalk_1.default.red(`❌ Error: ${error.message || error}`));
            }
            process.exit(1);
        }
    }
    getProgram() {
        return this.program;
    }
    getVersion() {
        return this.version;
    }
}
exports.SpecifyCLI = SpecifyCLI;
// Run if called directly
if (require.main === module) {
    const cli = new SpecifyCLI();
    cli.run().catch((error) => {
        console.error(chalk_1.default.red('Fatal error:'), error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map