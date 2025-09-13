"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskTracker = void 0;
const TaskState_1 = require("../models/TaskState");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class TaskTracker {
    constructor(projectConfig, options = {}) {
        this.tasks = new Map();
        this.listeners = [];
        this.saveTimeout = null;
        this.taskFilePath = path.join(path.dirname(projectConfig.configPath), 'tasks.json');
        this.options = {
            enableRealTimeUpdates: true,
            autoSave: true,
            maxHistoryItems: 1000,
            notificationThreshold: 5000, // 5 seconds
            ...options,
        };
    }
    async initialize() {
        await this.loadTasks();
    }
    async addTask(taskData) {
        const task = TaskState_1.TaskStateManager.create(taskData);
        if (taskData.estimatedDuration) {
            task.estimatedDuration = taskData.estimatedDuration;
        }
        if (taskData.tags) {
            task.tags = taskData.tags;
        }
        this.tasks.set(task.id, task);
        await this.notifyListeners();
        await this.scheduleAutoSave();
        return task;
    }
    async updateTask(taskId, updates) {
        const task = this.tasks.get(taskId);
        if (!task)
            return null;
        const updatedTask = {
            ...task,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        this.tasks.set(taskId, updatedTask);
        await this.notifyListeners();
        await this.scheduleAutoSave();
        return updatedTask;
    }
    async updateTaskStatus(taskId, status, metadata) {
        const task = this.tasks.get(taskId);
        if (!task)
            return null;
        const updatedTask = TaskState_1.TaskStateManager.transition(task, status, metadata);
        this.tasks.set(taskId, updatedTask);
        await this.notifyListeners();
        await this.scheduleAutoSave();
        return updatedTask;
    }
    async updateTaskProgress(taskId, progress) {
        const task = this.tasks.get(taskId);
        if (!task)
            return null;
        const updatedTask = TaskState_1.TaskStateManager.updateProgress(task, progress);
        this.tasks.set(taskId, updatedTask);
        await this.notifyListeners();
        await this.scheduleAutoSave();
        return updatedTask;
    }
    getTask(taskId) {
        return this.tasks.get(taskId) || null;
    }
    getAllTasks() {
        return Array.from(this.tasks.values());
    }
    getFilteredTasks(filter) {
        let filtered = this.getAllTasks();
        if (filter.status) {
            filtered = filtered.filter(task => filter.status.includes(task.status));
        }
        if (filter.category) {
            filtered = filtered.filter(task => filter.category.includes(task.metadata.category));
        }
        if (filter.priority) {
            filtered = filtered.filter(task => filter.priority.includes(task.priority));
        }
        if (filter.tags && filter.tags.length > 0) {
            filtered = filtered.filter(task => filter.tags.some(tag => task.tags.includes(tag)));
        }
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            filtered = filtered.filter(task => task.title.toLowerCase().includes(searchLower) ||
                task.description.toLowerCase().includes(searchLower) ||
                task.id.toLowerCase().includes(searchLower));
        }
        return filtered;
    }
    getTaskStats() {
        const tasks = this.getAllTasks();
        const total = tasks.length;
        if (total === 0) {
            return {
                total: 0,
                pending: 0,
                inProgress: 0,
                completed: 0,
                failed: 0,
                skipped: 0,
                percentComplete: 0,
                estimatedTimeRemaining: 0,
            };
        }
        const statusCounts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});
        const completed = statusCounts.completed || 0;
        const percentComplete = Math.round((completed / total) * 100);
        // Calculate estimated time remaining
        const remainingTasks = tasks.filter(t => ['pending', 'in_progress'].includes(t.status));
        const estimatedTimeRemaining = remainingTasks.reduce((sum, task) => {
            return sum + (task.estimatedDuration || 0);
        }, 0);
        return {
            total,
            pending: statusCounts.pending || 0,
            inProgress: statusCounts.in_progress || 0,
            completed,
            failed: statusCounts.failed || 0,
            skipped: statusCounts.skipped || 0,
            percentComplete,
            estimatedTimeRemaining,
        };
    }
    getReadyTasks() {
        const completedTaskIds = this.getAllTasks()
            .filter(t => t.status === 'completed')
            .map(t => t.id);
        return this.getAllTasks().filter(task => TaskState_1.TaskStateManager.canStart(task, completedTaskIds));
    }
    getParallelTasks() {
        const allTasks = this.getAllTasks();
        return TaskState_1.TaskStateManager.getParallelTasks(allTasks);
    }
    getBlockedTasks() {
        const completedTaskIds = this.getAllTasks()
            .filter(t => t.status === 'completed')
            .map(t => t.id);
        return this.getAllTasks().filter(task => {
            if (task.status !== 'pending')
                return false;
            return !TaskState_1.TaskStateManager.canStart(task, completedTaskIds);
        });
    }
    async markTaskAsFailed(taskId, errorMessage, allowRetry = true) {
        const task = this.tasks.get(taskId);
        if (!task)
            return null;
        const updatedTask = TaskState_1.TaskStateManager.transition(task, 'failed', {
            errorMessage,
            retryCount: allowRetry ? task.metadata.retryCount + 1 : task.metadata.maxRetries,
        });
        this.tasks.set(taskId, updatedTask);
        await this.notifyListeners();
        await this.scheduleAutoSave();
        return updatedTask;
    }
    async retryTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task || task.status !== 'failed')
            return null;
        if (task.metadata.retryCount >= task.metadata.maxRetries) {
            return null; // Max retries exceeded
        }
        const updatedTask = TaskState_1.TaskStateManager.transition(task, 'pending', {
            errorMessage: undefined,
        });
        this.tasks.set(taskId, updatedTask);
        await this.notifyListeners();
        await this.scheduleAutoSave();
        return updatedTask;
    }
    onTasksChanged(listener) {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    async saveTasks() {
        const tasksData = {
            tasks: Object.fromEntries(this.tasks),
            savedAt: new Date().toISOString(),
            version: '1.0',
        };
        await fs.ensureDir(path.dirname(this.taskFilePath));
        await fs.writeJson(this.taskFilePath, tasksData, { spaces: 2 });
    }
    async loadTasks() {
        try {
            if (await fs.pathExists(this.taskFilePath)) {
                const data = await fs.readJson(this.taskFilePath);
                if (data.tasks) {
                    this.tasks.clear();
                    for (const [id, taskData] of Object.entries(data.tasks)) {
                        this.tasks.set(id, taskData);
                    }
                }
            }
        }
        catch (error) {
            // If loading fails, start with empty task list
            this.tasks.clear();
        }
    }
    async clearCompleted() {
        const completedTasks = this.getAllTasks().filter(t => t.status === 'completed');
        for (const task of completedTasks) {
            this.tasks.delete(task.id);
        }
        await this.notifyListeners();
        await this.scheduleAutoSave();
        return completedTasks.length;
    }
    async reset() {
        this.tasks.clear();
        await this.notifyListeners();
        await this.saveTasks();
    }
    async notifyListeners() {
        if (!this.options.enableRealTimeUpdates)
            return;
        const tasks = this.getAllTasks();
        for (const listener of this.listeners) {
            try {
                listener(tasks);
            }
            catch (error) {
                // Continue notifying other listeners even if one fails
            }
        }
    }
    async scheduleAutoSave() {
        if (!this.options.autoSave)
            return;
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(async () => {
            try {
                await this.saveTasks();
            }
            catch (error) {
                // Auto-save failure - could log this
            }
        }, 1000); // Save after 1 second of inactivity
    }
}
exports.TaskTracker = TaskTracker;
//# sourceMappingURL=TaskTracker.js.map