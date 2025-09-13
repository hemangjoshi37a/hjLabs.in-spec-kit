import { TaskState } from '../../models/TaskState';
import blessed from 'blessed';
export interface TaskTrackingSidebarOptions {
    position: 'left' | 'right';
    width: number | string;
    height: number | string;
    autoUpdate: boolean;
    showProgress: boolean;
    showEstimates: boolean;
    maxDisplayTasks: number;
}
export interface SidebarTheme {
    border: string;
    background: string;
    header: string;
    completed: string;
    inProgress: string;
    pending: string;
    failed: string;
    progress: string;
}
export declare class TaskTrackingSidebar {
    private screen;
    private container;
    private taskList;
    private progressBar;
    private statsBox;
    private options;
    private theme;
    private tasks;
    private updateInterval;
    constructor(options?: Partial<TaskTrackingSidebarOptions>);
    initialize(screen?: blessed.Widgets.Screen): void;
    private createSidebarComponents;
    private setupEventHandlers;
    updateTasks(tasks: TaskState[]): void;
    private render;
    private calculateStats;
    private updateStatsDisplay;
    private updateTaskList;
    private formatTaskItem;
    private getStatusIcon;
    private getStatusColor;
    private getPriorityIcon;
    private formatDuration;
    private showTaskDetails;
    private showHelp;
    private refreshTasks;
    private startAutoUpdate;
    show(): void;
    hide(): void;
    focus(): void;
    isVisible(): boolean;
    getSelectedTask(): TaskState | null;
    selectTask(taskId: string): boolean;
    setTheme(theme: Partial<SidebarTheme>): void;
    destroy(): void;
}
//# sourceMappingURL=TaskTrackingSidebar.d.ts.map