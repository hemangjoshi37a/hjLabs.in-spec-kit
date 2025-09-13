import { Command } from 'commander';
export interface ListModelsOptions {
    format?: 'table' | 'json' | 'yaml';
    details?: boolean;
    current?: boolean;
    compatibility?: boolean;
}
export declare class ListModelsCommand {
    private projectDetector;
    constructor();
    create(): Command;
    execute(options: ListModelsOptions): Promise<void>;
    private outputTable;
    private outputJson;
    private outputYaml;
    getUsageExamples(): string[];
    getModelSuggestions(currentModel?: string): Promise<string[]>;
    compareModels(model1: string, model2: string): Promise<{
        model1: any;
        model2: any;
        differences: string[];
        recommendation?: string;
    } | null>;
}
//# sourceMappingURL=ListModelsCommand.d.ts.map