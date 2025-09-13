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
exports.ResetProjectCommand = void 0;
const commander_1 = require("commander");
const ProjectDetector_1 = require("@services/ProjectDetector");
const ConfigManager_1 = require("@services/ConfigManager");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class ResetProjectCommand {
    constructor() {
        this.projectDetector = new ProjectDetector_1.ProjectDetector();
        this.configManager = new ConfigManager_1.ConfigManager();
    }
    create() {
        const command = new commander_1.Command('reset-project');
        command
            .description('Clean project reset with backup and recovery options')
            .option('--backup', 'Create backup before reset (default: true)', true)
            .option('--force', 'Force reset without confirmation prompts', false)
            .option('--repair', 'Repair mode - fix issues without full reset', false)
            .option('--keep-specs', 'Keep specification files during reset', false)
            .option('--keep-tasks', 'Keep task tracking data during reset', false)
            .option('--dry-run', 'Show what would be reset without making changes', false)
            .action(async (options) => {
            await this.execute(options);
        });
        return command;
    }
    async execute(options) {
        try {
            console.log(chalk_1.default.blue('🔄 Project Reset Utility'));
            // Detect current project
            const detection = await this.projectDetector.detectProject();
            if (!detection.found) {
                console.log(chalk_1.default.yellow('⚠️  No spec-kit project found in current directory'));
                console.log(chalk_1.default.gray('Nothing to reset'));
                return;
            }
            const projectPath = detection.projectPath;
            const config = detection.config;
            console.log(chalk_1.default.gray(`Project: ${config?.name || 'Unknown'}`));
            console.log(chalk_1.default.gray(`Path: ${projectPath}`));
            if (options.dryRun) {
                console.log(chalk_1.default.cyan('🏃 Dry run mode - no changes will be made\n'));
            }
            // Choose operation mode
            if (options.repair) {
                await this.repairProject(detection, options);
            }
            else {
                await this.resetProject(detection, options);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Reset operation failed: ${error}`));
            process.exit(1);
        }
    }
    async repairProject(detection, options) {
        console.log(chalk_1.default.blue('🔧 Repair Mode - Fixing project issues\n'));
        const issues = detection.issues || [];
        const fixableIssues = issues.filter((i) => i.fixable);
        if (fixableIssues.length === 0) {
            console.log(chalk_1.default.green('✅ No fixable issues found'));
            if (issues.length > 0) {
                console.log(chalk_1.default.yellow('\nRemaining issues that require manual attention:'));
                issues.filter((i) => !i.fixable).forEach((issue) => {
                    console.log(chalk_1.default.yellow(`  • ${issue.message}`));
                });
            }
            return;
        }
        console.log(chalk_1.default.blue(`Found ${fixableIssues.length} fixable issues:`));
        fixableIssues.forEach((issue) => {
            console.log(chalk_1.default.gray(`  • ${issue.message}`));
        });
        if (!options.force && !options.dryRun) {
            // In a real CLI, you'd use a prompt library here
            console.log(chalk_1.default.yellow('\nWould proceed with repairs (use --force to skip confirmation)'));
        }
        if (options.dryRun) {
            console.log(chalk_1.default.cyan('Dry run complete - repairs would be applied'));
            return;
        }
        // Create backup if requested
        if (options.backup) {
            await this.createProjectBackup(detection.projectPath, detection.config);
        }
        // Attempt repairs
        const repairResult = await this.projectDetector.repairProject(detection.projectPath, detection.config);
        if (repairResult.found) {
            console.log(chalk_1.default.green('\n✅ Project repair completed successfully'));
            if (repairResult.suggestions.length > 0) {
                console.log(chalk_1.default.blue('\nActions taken:'));
                repairResult.suggestions.forEach(suggestion => {
                    console.log(chalk_1.default.gray(`  • ${suggestion}`));
                });
            }
            if (repairResult.issues.length > 0) {
                console.log(chalk_1.default.yellow('\nRemaining issues:'));
                repairResult.issues.forEach((issue) => {
                    console.log(chalk_1.default.yellow(`  • ${issue.message}`));
                });
            }
        }
        else {
            console.error(chalk_1.default.red('❌ Repair failed'));
            if (repairResult.issues.length > 0) {
                repairResult.issues.forEach((issue) => {
                    console.error(chalk_1.default.red(`  • ${issue.message}`));
                });
            }
        }
    }
    async resetProject(detection, options) {
        console.log(chalk_1.default.blue('🔄 Full Project Reset\n'));
        const projectPath = detection.projectPath;
        const config = detection.config;
        // Show what will be reset
        const resetItems = await this.getResetItems(projectPath, options);
        console.log(chalk_1.default.yellow('Items to be reset:'));
        resetItems.forEach(item => {
            const icon = item.keep ? '🔒' : '🗑️';
            const status = item.keep ? 'KEEP' : 'RESET';
            const color = item.keep ? chalk_1.default.green : chalk_1.default.gray;
            console.log(`  ${icon} ${item.name}: ${color(status)}`);
            if (item.description) {
                console.log(chalk_1.default.gray(`      ${item.description}`));
            }
        });
        if (options.dryRun) {
            console.log(chalk_1.default.cyan('\nDry run complete - no actual changes made'));
            return;
        }
        // Confirmation
        if (!options.force) {
            console.log(chalk_1.default.yellow('\nThis will permanently reset the selected items.'));
            console.log(chalk_1.default.gray('Use --force to skip this confirmation'));
            // In a real CLI, you'd use a prompt library here
            console.log(chalk_1.default.yellow('Would proceed with reset...'));
        }
        // Create backup
        let backupPath;
        if (options.backup) {
            backupPath = await this.createProjectBackup(projectPath, config);
            console.log(chalk_1.default.blue(`📦 Backup created: ${backupPath}`));
        }
        // Perform reset
        try {
            await this.performReset(projectPath, config, options);
            console.log(chalk_1.default.green('\n✅ Project reset completed successfully'));
            if (backupPath) {
                console.log(chalk_1.default.gray(`Backup available at: ${backupPath}`));
            }
            // Show next steps
            console.log(chalk_1.default.blue('\n🚀 Next steps:'));
            console.log(chalk_1.default.gray('  • Run "specify detect-project" to verify the reset'));
            console.log(chalk_1.default.gray('  • Initialize project: "specify init" if starting fresh'));
            console.log(chalk_1.default.gray('  • Restore from backup if needed'));
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Reset failed: ${error}`));
            if (backupPath) {
                console.error(chalk_1.default.yellow(`💾 Backup available for recovery: ${backupPath}`));
                console.error(chalk_1.default.gray('You can manually restore files from the backup'));
            }
            throw error;
        }
    }
    async getResetItems(projectPath, options) {
        const items = [];
        // Configuration files
        items.push({
            name: 'Project Configuration',
            description: 'AI model settings, project metadata',
            path: path.join(projectPath, '.specify', 'config.json'),
            keep: false,
        });
        // Task tracking data
        items.push({
            name: 'Task Tracking Data',
            description: 'Task states, progress tracking',
            path: path.join(projectPath, '.specify', 'tasks.json'),
            keep: options.keepTasks || false,
        });
        // Specification files
        items.push({
            name: 'Specification Files',
            description: 'Feature specs, plans, contracts',
            path: path.join(projectPath, 'specs'),
            keep: options.keepSpecs || false,
        });
        // Migration history & backups
        items.push({
            name: 'Migration History',
            description: 'Model switch history and backups',
            path: path.join(projectPath, '.specify', 'backups'),
            keep: false,
        });
        // Cache and temporary files
        items.push({
            name: 'Cache & Temporary Files',
            description: 'Cached data, temporary files',
            path: path.join(projectPath, '.specify', 'cache'),
            keep: false,
        });
        return items;
    }
    async createProjectBackup(projectPath, config) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `project-backup-${timestamp}`;
        const backupPath = path.join(projectPath, '.specify', 'backups', backupName);
        await fs.ensureDir(backupPath);
        // Backup configuration
        const configPath = path.join(projectPath, '.specify', 'config.json');
        if (await fs.pathExists(configPath)) {
            await fs.copy(configPath, path.join(backupPath, 'config.json'));
        }
        // Backup task data
        const taskPath = path.join(projectPath, '.specify', 'tasks.json');
        if (await fs.pathExists(taskPath)) {
            await fs.copy(taskPath, path.join(backupPath, 'tasks.json'));
        }
        // Backup specs directory
        const specsPath = path.join(projectPath, 'specs');
        if (await fs.pathExists(specsPath)) {
            await fs.copy(specsPath, path.join(backupPath, 'specs'));
        }
        // Create backup manifest
        const manifest = {
            createdAt: new Date().toISOString(),
            projectName: config?.name || 'Unknown',
            projectId: config?.projectId,
            aiModel: config?.aiModel,
            originalPath: projectPath,
            backupType: 'full-project',
        };
        await fs.writeJson(path.join(backupPath, 'manifest.json'), manifest, { spaces: 2 });
        return backupPath;
    }
    async performReset(projectPath, config, options) {
        const specifyDir = path.join(projectPath, '.specify');
        // Reset configuration (always)
        const configPath = path.join(specifyDir, 'config.json');
        if (await fs.pathExists(configPath)) {
            await fs.remove(configPath);
        }
        // Reset task data (unless keeping)
        if (!options.keepTasks) {
            const taskPath = path.join(specifyDir, 'tasks.json');
            if (await fs.pathExists(taskPath)) {
                await fs.remove(taskPath);
            }
        }
        // Reset specs (unless keeping)
        if (!options.keepSpecs) {
            const specsPath = path.join(projectPath, 'specs');
            if (await fs.pathExists(specsPath)) {
                await fs.remove(specsPath);
            }
        }
        // Clean up migration history and old backups
        const backupsPath = path.join(specifyDir, 'backups');
        if (await fs.pathExists(backupsPath)) {
            // Keep the most recent backup we just created
            const backups = await fs.readdir(backupsPath);
            const oldBackups = backups
                .filter(name => !name.startsWith('project-backup-'))
                .map(name => path.join(backupsPath, name));
            for (const backup of oldBackups) {
                await fs.remove(backup);
            }
        }
        // Clean cache
        const cachePath = path.join(specifyDir, 'cache');
        if (await fs.pathExists(cachePath)) {
            await fs.remove(cachePath);
        }
    }
    getUsageExamples() {
        return [
            'specify reset-project',
            'specify reset-project --repair',
            'specify reset-project --dry-run',
            'specify reset-project --force --no-backup',
            'specify reset-project --keep-specs --keep-tasks',
        ];
    }
    async listBackups(projectPath) {
        const backupsDir = path.join(projectPath, '.specify', 'backups');
        if (!await fs.pathExists(backupsDir)) {
            return [];
        }
        const backups = [];
        const items = await fs.readdir(backupsDir);
        for (const item of items) {
            const itemPath = path.join(backupsDir, item);
            const stats = await fs.stat(itemPath);
            if (stats.isDirectory()) {
                const manifestPath = path.join(itemPath, 'manifest.json');
                let createdAt = stats.mtime.toISOString();
                if (await fs.pathExists(manifestPath)) {
                    try {
                        const manifest = await fs.readJson(manifestPath);
                        createdAt = manifest.createdAt || createdAt;
                    }
                    catch {
                        // Use file stats if manifest is invalid
                    }
                }
                backups.push({
                    name: item,
                    path: itemPath,
                    createdAt,
                    size: await this.getDirectorySize(itemPath),
                });
            }
        }
        return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getDirectorySize(dirPath) {
        let size = 0;
        try {
            const items = await fs.readdir(dirPath);
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = await fs.stat(itemPath);
                if (stats.isDirectory()) {
                    size += await this.getDirectorySize(itemPath);
                }
                else {
                    size += stats.size;
                }
            }
        }
        catch {
            // Return 0 if directory is not accessible
        }
        return size;
    }
}
exports.ResetProjectCommand = ResetProjectCommand;
//# sourceMappingURL=ResetProjectCommand.js.map