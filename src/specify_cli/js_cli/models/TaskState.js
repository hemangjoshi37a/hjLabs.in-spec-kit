"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStateManager = void 0;
class TaskStateManager {
    static create(params) {
        const now = new Date().toISOString();
        return {
            ...params,
            status: 'pending',
            priority: params.priority || 'medium',
            tags: [],
            createdAt: now,
            updatedAt: now,
            dependencies: params.dependencies || [],
            blockedBy: [],
            progress: {
                percentage: 0,
                lastActivity: now,
            },
            metadata: {
                category: params.category,
                isParallel: params.isParallel || false,
                retryCount: 0,
                maxRetries: 3,
            },
        };
    }
    static transition(task, newStatus, metadata) {
        const now = new Date().toISOString();
        const updated = {
            ...task,
            status: newStatus,
            updatedAt: now,
            progress: {
                ...task.progress,
                lastActivity: now,
            },
            metadata: {
                ...task.metadata,
                ...metadata,
            },
        };
        // Set timestamps based on status transitions
        if (newStatus === 'in_progress' && !task.startedAt) {
            updated.startedAt = now;
            updated.progress.percentage = 10;
        }
        if (newStatus === 'completed' || newStatus === 'failed') {
            updated.completedAt = now;
            updated.progress.percentage = newStatus === 'completed' ? 100 : 0;
            if (updated.startedAt) {
                updated.actualDuration =
                    new Date(now).getTime() - new Date(updated.startedAt).getTime();
            }
        }
        return updated;
    }
    static updateProgress(task, progress) {
        return {
            ...task,
            updatedAt: new Date().toISOString(),
            progress: {
                ...task.progress,
                ...progress,
                lastActivity: new Date().toISOString(),
            },
        };
    }
    static canStart(task, completedTaskIds) {
        if (task.status !== 'pending')
            return false;
        if (task.blockedBy.length > 0)
            return false;
        return task.dependencies.every(depId => completedTaskIds.includes(depId));
    }
    static getParallelTasks(tasks) {
        return tasks.filter(task => task.metadata.isParallel &&
            task.status === 'pending');
    }
}
exports.TaskStateManager = TaskStateManager;
//# sourceMappingURL=TaskState.js.map