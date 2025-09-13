import { Command } from 'commander';
export interface TrackTasksOptions {
    sidebar?: boolean;
    format?: 'table' | 'json' | 'summary';
    filter?: string;
    watch?: boolean;
    export?: string;
}
export declare class TrackTasksCommand {
    private taskTracker;
    private projectDetector;
    private watchMode;
    constructor();
    create(): Command;
    execute(action: string, options: TrackTasksOptions): Promise<void>;
    private initializeTaskTracker;
    private enableTaskTracking;
    private disableTaskTracking;
    private showTaskStatus;
    private listTasks;
    private clearTasks;
    private showTaskStats;
    private displayTasks;
    private displayTaskTable;
    private displayTaskSummary;
    private renderTaskSidebar;
    private applyTaskFilter;
    private getStatusIcon;
    private getPriorityColor;
    private createProgressBar;
    private formatDuration;
    private saveTrackingPreferences;
    private exportTasks;
    getUsageExamples(): string[];
}
//# sourceMappingURL=TrackTasksCommand.d.ts.map