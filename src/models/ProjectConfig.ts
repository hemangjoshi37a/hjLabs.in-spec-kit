export interface ProjectConfig {
  projectId: string;
  name: string;
  aiModel: 'claude' | 'gemini';
  version: string;
  createdAt: string;
  updatedAt: string;
  specDirectory: string;
  configPath: string;
  isInitialized: boolean;
  migrationHistory: MigrationRecord[];
}

export interface MigrationRecord {
  id: string;
  fromModel: 'claude' | 'gemini';
  toModel: 'claude' | 'gemini';
  timestamp: string;
  success: boolean;
  backupPath?: string;
  errorMessage?: string;
}

export class ProjectConfigValidator {
  static validate(config: unknown): config is ProjectConfig {
    if (typeof config !== 'object' || config === null) {
      return false;
    }

    const c = config as Record<string, unknown>;

    return (
      typeof c.projectId === 'string' &&
      typeof c.name === 'string' &&
      (c.aiModel === 'claude' || c.aiModel === 'gemini') &&
      typeof c.version === 'string' &&
      typeof c.createdAt === 'string' &&
      typeof c.updatedAt === 'string' &&
      typeof c.specDirectory === 'string' &&
      typeof c.configPath === 'string' &&
      typeof c.isInitialized === 'boolean' &&
      Array.isArray(c.migrationHistory)
    );
  }

  static create(params: {
    projectId: string;
    name: string;
    aiModel: 'claude' | 'gemini';
    specDirectory: string;
    configPath: string;
  }): ProjectConfig {
    const now = new Date().toISOString();
    return {
      ...params,
      version: '0.1.0',
      createdAt: now,
      updatedAt: now,
      isInitialized: false,
      migrationHistory: [],
    };
  }
}