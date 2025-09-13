import { ProjectConfig } from '@models/ProjectConfig';
import { ConfigManager } from './ConfigManager';
export interface SwitchModelOptions {
    targetModel: 'claude' | 'gemini';
    createBackup?: boolean;
    dryRun?: boolean;
    force?: boolean;
}
export interface SwitchResult {
    success: boolean;
    migrationId: string;
    backupPath?: string;
    errorMessage?: string;
    warnings: string[];
}
export declare class ModelSwitcher {
    private configManager;
    private backupDirectory;
    constructor(configManager: ConfigManager, backupDirectory?: string);
    switchModel(projectConfig: ProjectConfig, options: SwitchModelOptions): Promise<SwitchResult>;
    private executeMigration;
    private validateProject;
    private createBackup;
    private updateProjectConfig;
    private migrateSpecFiles;
    private validateMigration;
    private rollbackMigration;
    private createBackupPath;
    private getSpecFiles;
    private getDirectorySize;
    private calculateChecksum;
    private calculateFileChecksum;
}
//# sourceMappingURL=ModelSwitcher.d.ts.map