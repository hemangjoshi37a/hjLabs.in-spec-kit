import { Command } from 'commander';
export interface DetectProjectOptions {
    validate?: boolean;
    autoFix?: boolean;
    repair?: boolean;
    verbose?: boolean;
    depth?: number;
    includeDrafts?: boolean;
}
export declare class DetectProjectCommand {
    private projectDetector;
    constructor();
    create(): Command;
    execute(options: DetectProjectOptions): Promise<void>;
    private displayIssues;
    private getIssueIcon;
    private getIssueColor;
    validateCurrentProject(): Promise<{
        valid: boolean;
        projectPath?: string;
        config?: any;
        issues: any[];
    }>;
    getUsageExamples(): string[];
    searchProjectsInDirectory(directory: string, maxDepth?: number): Promise<{
        projects: Array<{
            path: string;
            config?: any;
            valid: boolean;
        }>;
        totalFound: number;
    }>;
}
//# sourceMappingURL=DetectProjectCommand.d.ts.map