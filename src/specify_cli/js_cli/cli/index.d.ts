#!/usr/bin/env node
import { Command } from 'commander';
declare class SpecifyCLI {
    private program;
    private version;
    constructor();
    private loadVersion;
    private setupProgram;
    private setupCommands;
    private setupGlobalOptions;
    private setupErrorHandling;
    private showStatus;
    private showInfo;
    private createProgressBar;
    run(args?: string[]): Promise<void>;
    getProgram(): Command;
    getVersion(): string;
}
export { SpecifyCLI };
//# sourceMappingURL=index.d.ts.map