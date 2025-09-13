export interface ProjectConfig {
    projectId: string;
    name: string;
    aiModel: 'claude' | 'gemini';
    version: string;
    createdAt: string;
    updatedAt: string;
    specDirectory: string;
    configPath: string;
    isInitialized: boolean;
    migrationHistory: MigrationRecord[];
}
export interface MigrationRecord {
    id: string;
    fromModel: 'claude' | 'gemini';
    toModel: 'claude' | 'gemini';
    timestamp: string;
    success: boolean;
    backupPath?: string;
    errorMessage?: string;
}
export declare class ProjectConfigValidator {
    static validate(config: unknown): config is ProjectConfig;
    static create(params: {
        projectId: string;
        name: string;
        aiModel: 'claude' | 'gemini';
        specDirectory: string;
        configPath: string;
    }): ProjectConfig;
}
//# sourceMappingURL=ProjectConfig.d.ts.map