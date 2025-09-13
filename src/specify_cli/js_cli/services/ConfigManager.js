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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const ProjectConfig_1 = require("@models/ProjectConfig");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class ConfigManager {
    constructor(options = {}) {
        this.options = {
            enableBackup: true,
            maxBackups: 10,
            validateOnLoad: true,
            atomicWrites: true,
            ...options,
        };
        this.backupDirectory = './.specify/backups/config';
    }
    async loadConfig(configPath) {
        try {
            if (!await fs.pathExists(configPath)) {
                throw new Error(`Configuration file not found: ${configPath}`);
            }
            const configData = await fs.readJson(configPath);
            if (this.options.validateOnLoad && !ProjectConfig_1.ProjectConfigValidator.validate(configData)) {
                throw new Error('Invalid configuration file format');
            }
            return configData;
        }
        catch (error) {
            throw new Error(`Failed to load configuration: ${error}`);
        }
    }
    async saveConfig(config) {
        try {
            // Validate configuration before saving
            if (!ProjectConfig_1.ProjectConfigValidator.validate(config)) {
                throw new Error('Invalid configuration data');
            }
            // Create backup if enabled and file exists
            if (this.options.enableBackup && await fs.pathExists(config.configPath)) {
                await this.createBackup(config.configPath);
            }
            // Ensure directory exists
            await fs.ensureDir(path.dirname(config.configPath));
            // Update timestamp
            const configToSave = {
                ...config,
                updatedAt: new Date().toISOString(),
            };
            if (this.options.atomicWrites) {
                await this.atomicWrite(config.configPath, configToSave);
            }
            else {
                await fs.writeJson(config.configPath, configToSave, { spaces: 2 });
            }
        }
        catch (error) {
            throw new Error(`Failed to save configuration: ${error}`);
        }
    }
    async createConfig(params) {
        const configPath = path.join(params.projectPath, '.specify', 'config.json');
        const specDirectory = params.specDirectory || path.join(params.projectPath, 'specs');
        const config = ProjectConfig_1.ProjectConfigValidator.create({
            projectId: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: params.projectName,
            aiModel: params.aiModel,
            specDirectory,
            configPath,
        });
        config.isInitialized = true;
        await this.saveConfig(config);
        return config;
    }
    async updateConfig(configPath, updates) {
        const existing = await this.loadConfig(configPath);
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        await this.saveConfig(updated);
        return updated;
    }
    async validateConfig(configPath) {
        const errors = [];
        const warnings = [];
        try {
            if (!await fs.pathExists(configPath)) {
                errors.push('Configuration file does not exist');
                return { valid: false, errors, warnings };
            }
            const configData = await fs.readJson(configPath);
            if (!ProjectConfig_1.ProjectConfigValidator.validate(configData)) {
                errors.push('Invalid configuration file format');
            }
            const config = configData;
            // Check file paths exist
            if (!await fs.pathExists(config.specDirectory)) {
                warnings.push('Specification directory does not exist');
            }
            // Check AI model validity
            const { AIModelSettingsProvider } = await Promise.resolve().then(() => __importStar(require('@models/AIModelSettings')));
            if (!AIModelSettingsProvider.getSettings(config.aiModel)) {
                errors.push(`Unknown AI model: ${config.aiModel}`);
            }
            // Check for migration issues
            const incompleteMigrations = config.migrationHistory.filter(m => !m.success);
            if (incompleteMigrations.length > 0) {
                warnings.push(`${incompleteMigrations.length} incomplete migration(s) found`);
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings,
            };
        }
        catch (error) {
            errors.push(`Failed to validate configuration: ${error}`);
            return { valid: false, errors, warnings };
        }
    }
    async listBackups(configPath) {
        try {
            const configName = path.basename(configPath);
            const backupPattern = path.join(this.backupDirectory, `${configName}.backup.*`);
            const backupDir = path.dirname(backupPattern);
            if (!await fs.pathExists(backupDir)) {
                return [];
            }
            const files = await fs.readdir(backupDir);
            const backupFiles = files
                .filter(file => file.startsWith(`${configName}.backup.`))
                .map(file => path.join(backupDir, file));
            const backups = [];
            for (const backupPath of backupFiles) {
                try {
                    const stats = await fs.stat(backupPath);
                    const timestampMatch = path.basename(backupPath).match(/\.backup\.(.+)$/);
                    backups.push({
                        path: backupPath,
                        timestamp: timestampMatch ? timestampMatch[1] : stats.mtime.toISOString(),
                        originalPath: configPath,
                        size: stats.size,
                    });
                }
                catch (error) {
                    // Skip invalid backup files
                }
            }
            return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        catch (error) {
            return [];
        }
    }
    async restoreBackup(backupInfo) {
        try {
            if (!await fs.pathExists(backupInfo.path)) {
                throw new Error('Backup file not found');
            }
            // Create a backup of current file before restoring
            if (await fs.pathExists(backupInfo.originalPath)) {
                await this.createBackup(backupInfo.originalPath);
            }
            // Restore from backup
            await fs.copy(backupInfo.path, backupInfo.originalPath);
        }
        catch (error) {
            throw new Error(`Failed to restore backup: ${error}`);
        }
    }
    async cleanupBackups(configPath) {
        try {
            const backups = await this.listBackups(configPath);
            if (backups.length <= this.options.maxBackups) {
                return 0;
            }
            const backupsToDelete = backups.slice(this.options.maxBackups);
            for (const backup of backupsToDelete) {
                try {
                    await fs.remove(backup.path);
                }
                catch (error) {
                    // Continue cleaning other backups even if one fails
                }
            }
            return backupsToDelete.length;
        }
        catch (error) {
            return 0;
        }
    }
    async createBackup(configPath) {
        await fs.ensureDir(this.backupDirectory);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const configName = path.basename(configPath);
        const backupPath = path.join(this.backupDirectory, `${configName}.backup.${timestamp}`);
        await fs.copy(configPath, backupPath);
        // Cleanup old backups
        await this.cleanupBackups(configPath);
        return backupPath;
    }
    async atomicWrite(filePath, data) {
        const tempPath = `${filePath}.tmp`;
        try {
            // Write to temporary file
            await fs.writeJson(tempPath, data, { spaces: 2 });
            // Atomic move to final location
            await fs.move(tempPath, filePath);
        }
        catch (error) {
            // Cleanup temporary file if it exists
            try {
                await fs.remove(tempPath);
            }
            catch (cleanupError) {
                // Ignore cleanup errors
            }
            throw error;
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map