import { ProjectConfig } from '@models/ProjectConfig';
export interface ConfigManagerOptions {
    enableBackup: boolean;
    maxBackups: number;
    validateOnLoad: boolean;
    atomicWrites: boolean;
}
export interface BackupInfo {
    path: string;
    timestamp: string;
    originalPath: string;
    size: number;
}
export declare class ConfigManager {
    private options;
    private backupDirectory;
    constructor(options?: Partial<ConfigManagerOptions>);
    loadConfig(configPath: string): Promise<ProjectConfig>;
    saveConfig(config: ProjectConfig): Promise<void>;
    createConfig(params: {
        projectPath: string;
        projectName: string;
        aiModel: 'claude' | 'gemini';
        specDirectory?: string;
    }): Promise<ProjectConfig>;
    updateConfig(configPath: string, updates: Partial<ProjectConfig>): Promise<ProjectConfig>;
    validateConfig(configPath: string): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    listBackups(configPath: string): Promise<BackupInfo[]>;
    restoreBackup(backupInfo: BackupInfo): Promise<void>;
    cleanupBackups(configPath: string): Promise<number>;
    private createBackup;
    private atomicWrite;
}
//# sourceMappingURL=ConfigManager.d.ts.map