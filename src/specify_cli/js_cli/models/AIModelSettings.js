"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModelSettingsProvider = void 0;
class AIModelSettingsProvider {
    static getSettings(modelType) {
        return this.MODEL_DEFINITIONS[modelType] || null;
    }
    static getAllModels() {
        return Object.values(this.MODEL_DEFINITIONS);
    }
    static isCompatible(modelType, cliVersion) {
        const settings = this.getSettings(modelType);
        if (!settings)
            return false;
        // Simple version comparison (should use semver in production)
        return cliVersion >= settings.compatibility.minimumCliVersion;
    }
}
exports.AIModelSettingsProvider = AIModelSettingsProvider;
AIModelSettingsProvider.MODEL_DEFINITIONS = {
    claude: {
        modelType: 'claude',
        version: '3.0',
        capabilities: {
            maxTokens: 200000,
            supportedFormats: ['text', 'json', 'markdown', 'code'],
            features: [
                {
                    name: 'code-generation',
                    enabled: true,
                    description: 'Generate and refactor code',
                    requirements: ['typescript', 'javascript'],
                },
                {
                    name: 'spec-analysis',
                    enabled: true,
                    description: 'Analyze and validate specifications',
                },
                {
                    name: 'task-tracking',
                    enabled: true,
                    description: 'Track and update task progress',
                },
            ],
            rateLimit: {
                requestsPerMinute: 60,
                tokensPerMinute: 100000,
                dailyLimit: 1000000,
            },
        },
        configuration: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            customSettings: {},
        },
        compatibility: {
            supportedVersions: ['2.1', '3.0'],
            migrationSupport: true,
            minimumCliVersion: '0.1.0',
        },
    },
    gemini: {
        modelType: 'gemini',
        version: '1.5',
        capabilities: {
            maxTokens: 100000,
            supportedFormats: ['text', 'json', 'markdown'],
            features: [
                {
                    name: 'code-generation',
                    enabled: true,
                    description: 'Generate and refactor code',
                },
                {
                    name: 'spec-analysis',
                    enabled: true,
                    description: 'Analyze specifications',
                },
            ],
            rateLimit: {
                requestsPerMinute: 30,
                tokensPerMinute: 50000,
            },
        },
        configuration: {
            temperature: 0.8,
            maxOutputTokens: 2048,
            customSettings: {},
        },
        compatibility: {
            supportedVersions: ['1.0', '1.5'],
            migrationSupport: true,
            minimumCliVersion: '0.1.0',
        },
    },
};
//# sourceMappingURL=AIModelSettings.js.map