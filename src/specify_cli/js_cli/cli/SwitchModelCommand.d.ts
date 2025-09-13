import { Command } from 'commander';
export interface SwitchModelOptions {
    backup?: boolean;
    dryRun?: boolean;
    force?: boolean;
    validate?: boolean;
}
export declare class SwitchModelCommand {
    private modelSwitcher;
    private configManager;
    private projectDetector;
    constructor();
    create(): Command;
    execute(target: string, options: SwitchModelOptions): Promise<void>;
    validateArgs(target: string): Promise<{
        valid: boolean;
        errors: string[];
        suggestions: string[];
    }>;
    getUsageExamples(): string[];
}
//# sourceMappingURL=SwitchModelCommand.d.ts.map