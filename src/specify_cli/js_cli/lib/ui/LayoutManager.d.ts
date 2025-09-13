import blessed from 'blessed';
import { TaskTrackingSidebar } from './TaskTrackingSidebar';
import { TaskState } from '../../models/TaskState';
export interface LayoutConfiguration {
    sidebarEnabled: boolean;
    sidebarPosition: 'left' | 'right';
    sidebarWidth: number | string;
    mainContentPadding: number;
    theme: LayoutTheme;
}
export interface LayoutTheme {
    background: string;
    border: string;
    text: string;
    accent: string;
}
export interface ContentArea {
    log: blessed.Widgets.BoxElement;
    input?: blessed.Widgets.TextboxElement;
    status: blessed.Widgets.BoxElement;
}
export declare class LayoutManager {
    private screen;
    private sidebar;
    private mainContent;
    private contentAreas;
    private config;
    private isInitialized;
    constructor(config?: Partial<LayoutConfiguration>);
    initialize(): void;
    private createLayout;
    private createMainContent;
    private createContentAreas;
    private setupContentEvents;
    private setupGlobalEvents;
    enableSidebar(options?: {
        position?: 'left' | 'right';
        width?: number | string;
    }): void;
    disableSidebar(): void;
    toggleSidebar(): void;
    updateTasks(tasks: TaskState[]): void;
    log(message: string, level?: 'info' | 'warn' | 'error' | 'success'): void;
    updateStatus(status: string, type?: 'default' | 'progress' | 'error'): void;
    showProgressBar(percentage: number, label?: string): void;
    clearLog(): void;
    focusInput(): void;
    focusSidebar(): void;
    showHelp(): void;
    showModal(title: string, content: string): void;
    private handleCommand;
    private handleResize;
    private recreateLayout;
    private getLevelColor;
    private getLevelIcon;
    render(): void;
    getScreen(): blessed.Widgets.Screen;
    getSidebar(): TaskTrackingSidebar | null;
    isInitialized_(): boolean;
    getConfiguration(): LayoutConfiguration;
    updateConfiguration(updates: Partial<LayoutConfiguration>): void;
    destroy(): void;
}
//# sourceMappingURL=LayoutManager.d.ts.map