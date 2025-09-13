import { Command } from 'commander';
export interface ResetProjectOptions {
    backup?: boolean;
    force?: boolean;
    repair?: boolean;
    keepSpecs?: boolean;
    keepTasks?: boolean;
    dryRun?: boolean;
}
export declare class ResetProjectCommand {
    private projectDetector;
    private configManager;
    constructor();
    create(): Command;
    execute(options: ResetProjectOptions): Promise<void>;
    private repairProject;
    private resetProject;
    private getResetItems;
    private createProjectBackup;
    private performReset;
    getUsageExamples(): string[];
    listBackups(projectPath: string): Promise<Array<{
        name: string;
        path: string;
        createdAt: string;
        size: number;
    }>>;
    private getDirectorySize;
}
//# sourceMappingURL=ResetProjectCommand.d.ts.map