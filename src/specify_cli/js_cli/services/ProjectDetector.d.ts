import { ProjectConfig } from '../models/ProjectConfig';
export interface DetectionResult {
    found: boolean;
    projectPath?: string;
    config?: ProjectConfig;
    issues: DetectionIssue[];
    suggestions: string[];
}
export interface DetectionIssue {
    type: 'error' | 'warning' | 'info';
    message: string;
    path?: string;
    fixable: boolean;
}
export interface DetectionOptions {
    searchDepth?: number;
    validateConfig?: boolean;
    autoFix?: boolean;
    includeDrafts?: boolean;
}
export declare class ProjectDetector {
    private static readonly SPECIFY_DIR;
    private static readonly CONFIG_FILE;
    private static readonly SPEC_DIR;
    detectProject(startPath?: string, options?: DetectionOptions): Promise<DetectionResult>;
    validateProject(projectPath: string, config: ProjectConfig): Promise<DetectionIssue[]>;
    repairProject(projectPath: string, config?: ProjectConfig): Promise<DetectionResult>;
    private findSpecifyDirectory;
    private createDefaultConfig;
    private repairConfig;
    private validateProjectStructure;
    private checkMigrationIssues;
    private getSpecFiles;
    private fixIssue;
}
//# sourceMappingURL=ProjectDetector.d.ts.map