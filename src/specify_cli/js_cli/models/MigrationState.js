"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationStateManager = void 0;
class MigrationStateManager {
    static create(params) {
        const now = new Date().toISOString();
        const migrationId = `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            id: migrationId,
            fromModel: params.fromModel,
            toModel: params.toModel,
            projectId: params.projectId,
            status: 'pending',
            startedAt: now,
            steps: this.getDefaultSteps(params.fromModel, params.toModel),
            backup: {
                id: `backup_${migrationId}`,
                path: params.backupPath,
                createdAt: now,
                size: 0,
                checksum: '',
                files: [],
            },
            metadata: {
                version: '0.1.0',
                dryRun: params.dryRun || false,
                preserveHistory: true,
                userConfirmation: false,
                automaticRollback: true,
                skipValidation: false,
                customSettings: {},
            },
        };
    }
    static getDefaultSteps(fromModel, toModel) {
        const baseSteps = [
            {
                name: 'validate_project',
                description: 'Validate project configuration and structure',
                status: 'pending',
                order: 1,
                requiredFiles: ['.specify/config.json'],
                outputFiles: [],
            },
            {
                name: 'create_backup',
                description: 'Create backup of current project state',
                status: 'pending',
                order: 2,
                requiredFiles: [],
                outputFiles: [],
            },
            {
                name: 'update_config',
                description: `Update AI model from ${fromModel} to ${toModel}`,
                status: 'pending',
                order: 3,
                requiredFiles: ['.specify/config.json'],
                outputFiles: ['.specify/config.json'],
            },
            {
                name: 'migrate_specs',
                description: 'Migrate specification files to new model format',
                status: 'pending',
                order: 4,
                requiredFiles: [],
                outputFiles: [],
            },
            {
                name: 'update_tasks',
                description: 'Update task tracking configuration',
                status: 'pending',
                order: 5,
                requiredFiles: [],
                outputFiles: [],
            },
            {
                name: 'validate_migration',
                description: 'Validate migration success and functionality',
                status: 'pending',
                order: 6,
                requiredFiles: [],
                outputFiles: [],
            },
        ];
        return baseSteps.map((step, index) => ({
            ...step,
            id: `step_${index + 1}_${step.name}`,
        }));
    }
    static updateStep(migration, stepId, updates) {
        const steps = migration.steps.map(step => step.id === stepId ? { ...step, ...updates } : step);
        return {
            ...migration,
            steps,
        };
    }
    static startRollback(migration, reason) {
        return {
            ...migration,
            status: 'rolled_back',
            rollback: {
                triggeredAt: new Date().toISOString(),
                reason,
                success: false,
                restoredFiles: [],
            },
        };
    }
    static complete(migration, success) {
        const now = new Date().toISOString();
        const duration = migration.startedAt
            ? new Date(now).getTime() - new Date(migration.startedAt).getTime()
            : 0;
        return {
            ...migration,
            status: success ? 'completed' : 'failed',
            completedAt: now,
            duration,
        };
    }
    static canRollback(migration) {
        return (migration.status !== 'rolled_back' &&
            migration.backup.files.length > 0 &&
            migration.metadata.automaticRollback);
    }
}
exports.MigrationStateManager = MigrationStateManager;
//# sourceMappingURL=MigrationState.js.map