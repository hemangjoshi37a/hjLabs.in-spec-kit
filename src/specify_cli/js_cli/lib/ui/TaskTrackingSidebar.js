"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskTrackingSidebar = void 0;
const blessed_1 = __importDefault(require("blessed"));
class TaskTrackingSidebar {
    constructor(options = {}) {
        this.screen = null;
        this.container = null;
        this.taskList = null;
        this.progressBar = null;
        this.statsBox = null;
        this.tasks = [];
        this.updateInterval = null;
        this.options = {
            position: 'right',
            width: '25%',
            height: '100%',
            autoUpdate: true,
            showProgress: true,
            showEstimates: true,
            maxDisplayTasks: 10,
            ...options,
        };
        this.theme = {
            border: 'line',
            background: 'black',
            header: 'cyan',
            completed: 'green',
            inProgress: 'yellow',
            pending: 'gray',
            failed: 'red',
            progress: 'blue',
        };
    }
    initialize(screen) {
        this.screen = screen || blessed_1.default.screen({
            smartCSR: true,
            title: 'Specify CLI - Task Tracking',
        });
        this.createSidebarComponents();
        this.setupEventHandlers();
        if (this.options.autoUpdate) {
            this.startAutoUpdate();
        }
    }
    createSidebarComponents() {
        if (!this.screen)
            return;
        // Main container
        this.container = blessed_1.default.box({
            top: 0,
            left: this.options.position === 'left' ? 0 : `${100 - parseInt(this.options.width.toString())}%`,
            width: this.options.width,
            height: this.options.height,
            border: {
                type: this.theme.border,
            },
            style: {
                border: {
                    fg: this.theme.header,
                },
                bg: this.theme.background,
            },
            tags: true,
            label: ' Task Tracking ',
        });
        // Stats box
        this.statsBox = blessed_1.default.box({
            top: 0,
            left: 0,
            width: '100%',
            height: 4,
            content: 'Loading tasks...',
            style: {
                fg: 'white',
                bg: this.theme.background,
            },
            tags: true,
        });
        // Progress bar (if enabled)
        if (this.options.showProgress) {
            this.progressBar = blessed_1.default.progressbar({
                top: 4,
                left: 1,
                width: '100%-2',
                height: 1,
                style: {
                    bar: {
                        bg: this.theme.progress,
                    },
                },
                filled: 0,
            });
        }
        // Task list
        this.taskList = blessed_1.default.list({
            top: this.options.showProgress ? 6 : 4,
            left: 0,
            width: '100%',
            height: `100%-${this.options.showProgress ? 6 : 4}`,
            items: [],
            scrollable: true,
            alwaysScroll: true,
            mouse: true,
            keys: true,
            style: {
                item: {
                    fg: 'white',
                },
                selected: {
                    fg: 'black',
                    bg: 'white',
                },
            },
            tags: true,
        });
        // Add components to container
        this.container.append(this.statsBox);
        if (this.progressBar) {
            this.container.append(this.progressBar);
        }
        this.container.append(this.taskList);
        // Add container to screen
        this.screen.append(this.container);
    }
    setupEventHandlers() {
        if (!this.screen || !this.taskList)
            return;
        // Handle screen resize
        this.screen.on('resize', () => {
            this.render();
        });
        // Handle task selection
        this.taskList.on('select', (item, index) => {
            const task = this.tasks[index];
            if (task) {
                this.showTaskDetails(task);
            }
        });
        // Handle key events
        this.screen.key(['q', 'C-c'], () => {
            this.destroy();
            process.exit(0);
        });
        this.screen.key(['r'], () => {
            this.refreshTasks();
        });
        this.screen.key(['?', 'h'], () => {
            this.showHelp();
        });
    }
    updateTasks(tasks) {
        this.tasks = tasks;
        this.render();
    }
    render() {
        if (!this.screen || !this.taskList || !this.statsBox)
            return;
        // Update stats
        const stats = this.calculateStats();
        this.updateStatsDisplay(stats);
        // Update progress bar
        if (this.progressBar) {
            this.progressBar.setProgress(stats.percentComplete);
        }
        // Update task list
        this.updateTaskList();
        // Render screen
        this.screen.render();
    }
    calculateStats() {
        const total = this.tasks.length;
        if (total === 0) {
            return {
                total: 0,
                completed: 0,
                inProgress: 0,
                pending: 0,
                failed: 0,
                percentComplete: 0,
                estimatedTimeRemaining: 0,
            };
        }
        const statusCounts = this.tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});
        const completed = statusCounts.completed || 0;
        const percentComplete = Math.round((completed / total) * 100);
        // Calculate estimated time remaining
        const remainingTasks = this.tasks.filter(t => ['pending', 'in_progress'].includes(t.status));
        const estimatedTimeRemaining = remainingTasks.reduce((sum, task) => {
            return sum + (task.estimatedDuration || 0);
        }, 0);
        return {
            total,
            completed,
            inProgress: statusCounts.in_progress || 0,
            pending: statusCounts.pending || 0,
            failed: statusCounts.failed || 0,
            percentComplete,
            estimatedTimeRemaining,
        };
    }
    updateStatsDisplay(stats) {
        if (!this.statsBox)
            return;
        let content = `{center}{bold}Task Overview{/bold}{/center}\n`;
        content += `Total: ${stats.total} | Complete: {${this.theme.completed}-fg}${stats.completed}{/}\n`;
        content += `Active: {${this.theme.inProgress}-fg}${stats.inProgress}{/} | Pending: {${this.theme.pending}-fg}${stats.pending}{/}`;
        if (stats.failed > 0) {
            content += ` | Failed: {${this.theme.failed}-fg}${stats.failed}{/}`;
        }
        if (this.options.showEstimates && stats.estimatedTimeRemaining > 0) {
            const timeStr = this.formatDuration(stats.estimatedTimeRemaining);
            content += `\nEst. remaining: ${timeStr}`;
        }
        this.statsBox.setContent(content);
    }
    updateTaskList() {
        if (!this.taskList)
            return;
        const displayTasks = this.tasks.slice(0, this.options.maxDisplayTasks);
        const items = displayTasks.map(task => this.formatTaskItem(task));
        // Add overflow indicator if needed
        if (this.tasks.length > this.options.maxDisplayTasks) {
            const overflow = this.tasks.length - this.options.maxDisplayTasks;
            items.push(`{gray-fg}... and ${overflow} more tasks{/}`);
        }
        this.taskList.setItems(items);
    }
    formatTaskItem(task) {
        const statusIcon = this.getStatusIcon(task.status);
        const statusColor = this.getStatusColor(task.status);
        const priorityIcon = this.getPriorityIcon(task.priority);
        let item = `${statusIcon} {${statusColor}-fg}${task.title}{/}`;
        // Add priority indicator
        if (task.priority !== 'medium') {
            item += ` ${priorityIcon}`;
        }
        // Add progress indicator
        if (task.status === 'in_progress' && task.progress.percentage > 0) {
            item += ` (${task.progress.percentage}%)`;
        }
        // Add category tag
        item += ` {gray-fg}[${task.metadata.category}]{/}`;
        return item;
    }
    getStatusIcon(status) {
        switch (status) {
            case 'completed': return '✓';
            case 'in_progress': return '⚡';
            case 'pending': return '⏳';
            case 'failed': return '✗';
            case 'skipped': return '⏭';
            default: return '•';
        }
    }
    getStatusColor(status) {
        switch (status) {
            case 'completed': return this.theme.completed;
            case 'in_progress': return this.theme.inProgress;
            case 'pending': return this.theme.pending;
            case 'failed': return this.theme.failed;
            default: return 'white';
        }
    }
    getPriorityIcon(priority) {
        switch (priority) {
            case 'critical': return '{red-fg}🔥{/}';
            case 'high': return '{red-fg}⚠{/}';
            case 'low': return '{gray-fg}💤{/}';
            default: return '';
        }
    }
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
            return `${hours}h${minutes % 60}m`;
        }
        else if (minutes > 0) {
            return `${minutes}m${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
    }
    showTaskDetails(task) {
        if (!this.screen)
            return;
        const detailsBox = blessed_1.default.box({
            top: 'center',
            left: 'center',
            width: '60%',
            height: '50%',
            border: {
                type: 'line',
            },
            style: {
                border: {
                    fg: 'cyan',
                },
                bg: 'black',
            },
            tags: true,
            label: ` Task Details `,
        });
        let content = `{bold}${task.title}{/bold}\n\n`;
        content += `Description: ${task.description}\n`;
        content += `Status: {${this.getStatusColor(task.status)}-fg}${task.status}{/}\n`;
        content += `Priority: ${task.priority}\n`;
        content += `Category: ${task.metadata.category}\n`;
        content += `Progress: ${task.progress.percentage}%\n`;
        if (task.estimatedDuration) {
            content += `Estimated: ${this.formatDuration(task.estimatedDuration)}\n`;
        }
        if (task.actualDuration) {
            content += `Actual: ${this.formatDuration(task.actualDuration)}\n`;
        }
        if (task.dependencies.length > 0) {
            content += `Dependencies: ${task.dependencies.join(', ')}\n`;
        }
        if (task.metadata.errorMessage) {
            content += `\n{red-fg}Error: ${task.metadata.errorMessage}{/}`;
        }
        content += '\n\n{gray-fg}Press ESC to close{/}';
        detailsBox.setContent(content);
        detailsBox.key(['escape'], () => {
            this.screen.remove(detailsBox);
            this.screen.render();
        });
        this.screen.append(detailsBox);
        detailsBox.focus();
        this.screen.render();
    }
    showHelp() {
        if (!this.screen)
            return;
        const helpBox = blessed_1.default.box({
            top: 'center',
            left: 'center',
            width: '50%',
            height: '60%',
            border: {
                type: 'line',
            },
            style: {
                border: {
                    fg: 'cyan',
                },
                bg: 'black',
            },
            tags: true,
            label: ' Help ',
        });
        const content = `{bold}Task Tracking Sidebar Help{/bold}

{bold}Navigation:{/bold}
↑/↓      Navigate tasks
Enter    View task details
r        Refresh tasks
q/Ctrl+C Quit
h/?      Show this help

{bold}Status Icons:{/bold}
✓ Completed
⚡ In Progress
⏳ Pending
✗ Failed
⏭ Skipped

{bold}Priority Indicators:{/bold}
🔥 Critical
⚠ High
💤 Low

{gray-fg}Press ESC to close{/}`;
        helpBox.setContent(content);
        helpBox.key(['escape'], () => {
            this.screen.remove(helpBox);
            this.screen.render();
        });
        this.screen.append(helpBox);
        helpBox.focus();
        this.screen.render();
    }
    refreshTasks() {
        // In a real implementation, this would trigger a task refresh
        // For now, just re-render with current tasks
        this.render();
    }
    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.updateInterval = setInterval(() => {
            this.render();
        }, 2000); // Update every 2 seconds
    }
    show() {
        if (this.container) {
            this.container.show();
        }
        if (this.screen) {
            this.screen.render();
        }
    }
    hide() {
        if (this.container) {
            this.container.hide();
        }
        if (this.screen) {
            this.screen.render();
        }
    }
    focus() {
        if (this.taskList) {
            this.taskList.focus();
        }
    }
    isVisible() {
        return this.container ? this.container.visible : false;
    }
    getSelectedTask() {
        if (!this.taskList)
            return null;
        const selectedIndex = this.taskList.selected;
        return this.tasks[selectedIndex] || null;
    }
    selectTask(taskId) {
        const index = this.tasks.findIndex(task => task.id === taskId);
        if (index >= 0 && this.taskList) {
            this.taskList.select(index);
            return true;
        }
        return false;
    }
    setTheme(theme) {
        this.theme = { ...this.theme, ...theme };
        this.render();
    }
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.screen) {
            this.screen.destroy();
            this.screen = null;
        }
    }
}
exports.TaskTrackingSidebar = TaskTrackingSidebar;
//# sourceMappingURL=TaskTrackingSidebar.js.map