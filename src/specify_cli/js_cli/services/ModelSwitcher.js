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
exports.ModelSwitcher = void 0;
const MigrationState_1 = require("../models/MigrationState");
const AIModelSettings_1 = require("../models/AIModelSettings");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
class ModelSwitcher {
    constructor(configManager, backupDirectory = './.specify/backups') {
        this.configManager = configManager;
        this.backupDirectory = backupDirectory;
    }
    async switchModel(projectConfig, options) {
        const warnings = [];
        try {
            // Validate target model
            if (projectConfig.aiModel === options.targetModel) {
                return {
                    success: false,
                    migrationId: '',
                    errorMessage: `Project is already using ${options.targetModel}`,
                    warnings,
                };
            }
            // Check model compatibility
            const targetSettings = AIModelSettings_1.AIModelSettingsProvider.getSettings(options.targetModel);
            if (!targetSettings) {
                return {
                    success: false,
                    migrationId: '',
                    errorMessage: `Unknown target model: ${options.targetModel}`,
                    warnings,
                };
            }
            // Check compatibility warnings
            if (targetSettings.compatibility.deprecationWarning) {
                warnings.push(targetSettings.compatibility.deprecationWarning);
            }
            // Create migration state
            const backupPath = await this.createBackupPath(projectConfig.projectId);
            const migration = MigrationState_1.MigrationStateManager.create({
                fromModel: projectConfig.aiModel,
                toModel: options.targetModel,
                projectId: projectConfig.projectId,
                backupPath,
                dryRun: options.dryRun || false,
            });
            if (options.dryRun) {
                return {
                    success: true,
                    migrationId: migration.id,
                    warnings: [...warnings, 'Dry run completed - no changes made'],
                };
            }
            // Execute migration steps
            const result = await this.executeMigration(migration, projectConfig, options);
            return {
                ...result,
                warnings,
            };
        }
        catch (error) {
            return {
                success: false,
                migrationId: '',
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                warnings,
            };
        }
    }
    async executeMigration(migration, projectConfig, options) {
        try {
            // Step 1: Validate project
            await this.validateProject(projectConfig);
            // Step 2: Create backup
            if (options.createBackup !== false) {
                await this.createBackup(migration, projectConfig);
            }
            // Step 3: Update configuration
            const updatedConfig = await this.updateProjectConfig(projectConfig, migration.toModel, migration.id);
            // Step 4: Migrate spec files (if needed)
            await this.migrateSpecFiles(projectConfig, migration);
            // Step 5: Validate migration
            await this.validateMigration(updatedConfig);
            const completedMigration = MigrationState_1.MigrationStateManager.complete(migration, true);
            return {
                success: true,
                migrationId: completedMigration.id,
                backupPath: migration.backup.path,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Migration failed';
            // Attempt rollback if backup exists
            if (migration.backup.files.length > 0 && MigrationState_1.MigrationStateManager.canRollback(migration)) {
                try {
                    await this.rollbackMigration(migration);
                }
                catch (rollbackError) {
                    return {
                        success: false,
                        migrationId: migration.id,
                        errorMessage: `${errorMessage}. Rollback also failed: ${rollbackError}`,
                    };
                }
            }
            return {
                success: false,
                migrationId: migration.id,
                errorMessage,
                backupPath: migration.backup.path,
            };
        }
    }
    async validateProject(config) {
        if (!config.isInitialized) {
            throw new Error('Project is not properly initialized');
        }
        if (!await fs.pathExists(config.configPath)) {
            throw new Error('Project configuration file not found');
        }
        if (!await fs.pathExists(config.specDirectory)) {
            throw new Error('Specification directory not found');
        }
    }
    async createBackup(migration, config) {
        await fs.ensureDir(this.backupDirectory);
        const backupDir = path.join(this.backupDirectory, migration.backup.id);
        await fs.ensureDir(backupDir);
        // Copy configuration files
        const configBackupPath = path.join(backupDir, 'config.json');
        await fs.copy(config.configPath, configBackupPath);
        // Copy spec directory
        const specBackupPath = path.join(backupDir, 'specs');
        await fs.copy(config.specDirectory, specBackupPath);
        // Update backup info
        const stats = await fs.stat(backupDir);
        migration.backup.size = await this.getDirectorySize(backupDir);
        migration.backup.checksum = await this.calculateChecksum(backupDir);
        migration.backup.files = [
            {
                originalPath: config.configPath,
                backupPath: configBackupPath,
                checksum: await this.calculateFileChecksum(configBackupPath),
                size: (await fs.stat(configBackupPath)).size,
            },
            {
                originalPath: config.specDirectory,
                backupPath: specBackupPath,
                checksum: await this.calculateFileChecksum(specBackupPath),
                size: await this.getDirectorySize(specBackupPath),
            },
        ];
    }
    async updateProjectConfig(config, targetModel, migrationId) {
        const updatedConfig = {
            ...config,
            aiModel: targetModel,
            updatedAt: new Date().toISOString(),
            migrationHistory: [
                ...config.migrationHistory,
                {
                    id: migrationId,
                    fromModel: config.aiModel,
                    toModel: targetModel,
                    timestamp: new Date().toISOString(),
                    success: true,
                },
            ],
        };
        await this.configManager.saveConfig(updatedConfig);
        return updatedConfig;
    }
    async migrateSpecFiles(config, migration) {
        // In a real implementation, this would handle model-specific
        // spec format migrations (e.g., Claude vs Gemini prompt formats)
        // For now, we'll just ensure files are accessible
        const specFiles = await this.getSpecFiles(config.specDirectory);
        for (const file of specFiles) {
            const content = await fs.readFile(file, 'utf8');
            // Perform any model-specific transformations here
            await fs.writeFile(file, content);
        }
    }
    async validateMigration(config) {
        // Verify the updated configuration is valid
        if (!await fs.pathExists(config.configPath)) {
            throw new Error('Configuration file missing after migration');
        }
        const savedConfig = await this.configManager.loadConfig(config.configPath);
        if (savedConfig.aiModel !== config.aiModel) {
            throw new Error('Configuration not properly updated');
        }
    }
    async rollbackMigration(migration) {
        const rollbackState = MigrationState_1.MigrationStateManager.startRollback(migration, 'Migration failed, attempting rollback');
        for (const file of migration.backup.files) {
            if (await fs.pathExists(file.backupPath)) {
                await fs.copy(file.backupPath, file.originalPath);
                rollbackState.rollback.restoredFiles.push(file.originalPath);
            }
        }
        rollbackState.rollback.success = true;
        rollbackState.rollback.completedAt = new Date().toISOString();
    }
    async createBackupPath(projectId) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return path.join(this.backupDirectory, `${projectId}_${timestamp}`);
    }
    async getSpecFiles(specDirectory) {
        const files = [];
        const items = await fs.readdir(specDirectory);
        for (const item of items) {
            const itemPath = path.join(specDirectory, item);
            const stats = await fs.stat(itemPath);
            if (stats.isDirectory()) {
                files.push(...(await this.getSpecFiles(itemPath)));
            }
            else if (item.endsWith('.md') || item.endsWith('.json')) {
                files.push(itemPath);
            }
        }
        return files;
    }
    async getDirectorySize(dirPath) {
        let size = 0;
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
        return size;
    }
    async calculateChecksum(path) {
        // Simplified checksum - in production, use crypto.createHash
        return `checksum_${Date.now()}_${Math.random()}`;
    }
    async calculateFileChecksum(filePath) {
        // Simplified checksum - in production, use crypto.createHash
        const stats = await fs.stat(filePath);
        return `file_${stats.size}_${stats.mtime.getTime()}`;
    }
}
exports.ModelSwitcher = ModelSwitcher;
//# sourceMappingURL=ModelSwitcher.js.map