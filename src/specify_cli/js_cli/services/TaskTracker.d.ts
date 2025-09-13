import { TaskState } from '@models/TaskState';
import { ProjectConfig } from '@models/ProjectConfig';
export interface TaskTrackingOptions {
    enableRealTimeUpdates: boolean;
    autoSave: boolean;
    maxHistoryItems: number;
    notificationThreshold: number;
}
export interface TaskFilter {
    status?: TaskState['status'][];
    category?: TaskState['metadata']['category'][];
    priority?: TaskState['priority'][];
    tags?: string[];
    search?: string;
}
export interface TaskStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    skipped: number;
    percentComplete: number;
    estimatedTimeRemaining: number;
}
export declare class TaskTracker {
    private tasks;
    private taskFilePath;
    private options;
    private listeners;
    private saveTimeout;
    constructor(projectConfig: ProjectConfig, options?: Partial<TaskTrackingOptions>);
    initialize(): Promise<void>;
    addTask(taskData: {
        id: string;
        title: string;
        description: string;
        category: TaskState['metadata']['category'];
        isParallel?: boolean;
        dependencies?: string[];
        priority?: TaskState['priority'];
        estimatedDuration?: number;
        tags?: string[];
    }): Promise<TaskState>;
    updateTask(taskId: string, updates: Partial<TaskState>): Promise<TaskState | null>;
    updateTaskStatus(taskId: string, status: TaskState['status'], metadata?: Partial<TaskState['metadata']>): Promise<TaskState | null>;
    updateTaskProgress(taskId: string, progress: Partial<TaskState['progress']>): Promise<TaskState | null>;
    getTask(taskId: string): TaskState | null;
    getAllTasks(): TaskState[];
    getFilteredTasks(filter: TaskFilter): TaskState[];
    getTaskStats(): TaskStats;
    getReadyTasks(): TaskState[];
    getParallelTasks(): TaskState[];
    getBlockedTasks(): TaskState[];
    markTaskAsFailed(taskId: string, errorMessage: string, allowRetry?: boolean): Promise<TaskState | null>;
    retryTask(taskId: string): Promise<TaskState | null>;
    onTasksChanged(listener: (tasks: TaskState[]) => void): () => void;
    saveTasks(): Promise<void>;
    loadTasks(): Promise<void>;
    clearCompleted(): Promise<number>;
    reset(): Promise<void>;
    private notifyListeners;
    private scheduleAutoSave;
}
//# sourceMappingURL=TaskTracker.d.ts.map