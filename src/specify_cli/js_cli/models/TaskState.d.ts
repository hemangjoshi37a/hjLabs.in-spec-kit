export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
export interface TaskState {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    dependencies: string[];
    blockedBy: string[];
    progress: TaskProgress;
    metadata: TaskMetadata;
}
export interface TaskProgress {
    percentage: number;
    currentStep?: string;
    totalSteps?: number;
    completedSteps?: number;
    lastActivity: string;
}
export interface TaskMetadata {
    category: 'setup' | 'test' | 'implementation' | 'ui' | 'integration' | 'polish';
    filePath?: string;
    isParallel: boolean;
    requirements?: string[];
    outputs?: string[];
    errorMessage?: string;
    retryCount: number;
    maxRetries: number;
}
export declare class TaskStateManager {
    static create(params: {
        id: string;
        title: string;
        description: string;
        category: TaskMetadata['category'];
        isParallel?: boolean;
        dependencies?: string[];
        priority?: TaskState['priority'];
    }): TaskState;
    static transition(task: TaskState, newStatus: TaskStatus, metadata?: Partial<TaskMetadata>): TaskState;
    static updateProgress(task: TaskState, progress: Partial<TaskProgress>): TaskState;
    static canStart(task: TaskState, completedTaskIds: string[]): boolean;
    static getParallelTasks(tasks: TaskState[]): TaskState[];
}
//# sourceMappingURL=TaskState.d.ts.map