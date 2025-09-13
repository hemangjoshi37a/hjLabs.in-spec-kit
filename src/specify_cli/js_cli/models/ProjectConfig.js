"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectConfigValidator = void 0;
class ProjectConfigValidator {
    static validate(config) {
        if (typeof config !== 'object' || config === null) {
            return false;
        }
        const c = config;
        return (typeof c.projectId === 'string' &&
            typeof c.name === 'string' &&
            (c.aiModel === 'claude' || c.aiModel === 'gemini') &&
            typeof c.version === 'string' &&
            typeof c.createdAt === 'string' &&
            typeof c.updatedAt === 'string' &&
            typeof c.specDirectory === 'string' &&
            typeof c.configPath === 'string' &&
            typeof c.isInitialized === 'boolean' &&
            Array.isArray(c.migrationHistory));
    }
    static create(params) {
        const now = new Date().toISOString();
        return {
            ...params,
            version: '0.1.0',
            createdAt: now,
            updatedAt: now,
            isInitialized: false,
            migrationHistory: [],
        };
    }
}
exports.ProjectConfigValidator = ProjectConfigValidator;
//# sourceMappingURL=ProjectConfig.js.map