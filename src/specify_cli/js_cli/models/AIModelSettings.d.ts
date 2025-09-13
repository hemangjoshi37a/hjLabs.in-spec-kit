export interface AIModelSettings {
    modelType: 'claude' | 'gemini';
    version: string;
    capabilities: ModelCapabilities;
    configuration: ModelConfiguration;
    compatibility: CompatibilityInfo;
}
export interface ModelCapabilities {
    maxTokens: number;
    supportedFormats: string[];
    features: ModelFeature[];
    rateLimit: RateLimit;
}
export interface ModelFeature {
    name: string;
    enabled: boolean;
    description: string;
    requirements?: string[];
}
export interface RateLimit {
    requestsPerMinute: number;
    tokensPerMinute: number;
    dailyLimit?: number;
}
export interface ModelConfiguration {
    apiEndpoint?: string;
    apiKey?: string;
    temperature?: number;
    maxOutputTokens?: number;
    customSettings?: Record<string, unknown>;
}
export interface CompatibilityInfo {
    supportedVersions: string[];
    migrationSupport: boolean;
    deprecationWarning?: string;
    minimumCliVersion: string;
}
export declare class AIModelSettingsProvider {
    private static readonly MODEL_DEFINITIONS;
    static getSettings(modelType: 'claude' | 'gemini'): AIModelSettings | null;
    static getAllModels(): AIModelSettings[];
    static isCompatible(modelType: 'claude' | 'gemini', cliVersion: string): boolean;
}
//# sourceMappingURL=AIModelSettings.d.ts.map