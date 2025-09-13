export type MigrationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
export interface MigrationState {
    id: string;
    fromModel: 'claude' | 'gemini';
    toModel: 'claude' | 'gemini';
    projectId: string;
    status: MigrationStatus;
    startedAt: string;
    completedAt?: string;
    duration?: number;
    steps: MigrationStep[];
    backup: BackupInfo;
    rollback?: RollbackInfo;
    metadata: MigrationMetadata;
}
export interface MigrationStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
    order: number;
    startedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    rollbackCommand?: string;
    requiredFiles: string[];
    outputFiles: string[];
}
export interface BackupInfo {
    id: string;
    path: string;
    createdAt: string;
    size: number;
    checksum: string;
    files: BackupFile[];
}
export interface BackupFile {
    originalPath: string;
    backupPath: string;
    checksum: string;
    size: number;
}
export interface RollbackInfo {
    triggeredAt: string;
    reason: string;
    completedAt?: string;
    success: boolean;
    restoredFiles: string[];
    errorMessage?: string;
}
export interface MigrationMetadata {
    version: string;
    dryRun: boolean;
    preserveHistory: boolean;
    userConfirmation: boolean;
    automaticRollback: boolean;
    skipValidation: boolean;
    customSettings: Record<string, unknown>;
}
export declare class MigrationStateManager {
    static create(params: {
        fromModel: 'claude' | 'gemini';
        toModel: 'claude' | 'gemini';
        projectId: string;
        backupPath: string;
        dryRun?: boolean;
    }): MigrationState;
    private static getDefaultSteps;
    static updateStep(migration: MigrationState, stepId: string, updates: Partial<MigrationStep>): MigrationState;
    static startRollback(migration: MigrationState, reason: string): MigrationState;
    static complete(migration: MigrationState, success: boolean): MigrationState;
    static canRollback(migration: MigrationState): boolean;
}
//# sourceMappingURL=MigrationState.d.ts.map