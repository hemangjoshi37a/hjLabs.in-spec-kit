# hjLabs.in-spec-kit Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-13

## Active Technologies
- Node.js/TypeScript CLI tool with library components (001-ai-model-switching)
- Commander.js for CLI parsing, Blessed.js for terminal UI (001-ai-model-switching)
- JSON-based configuration and state management (001-ai-model-switching)

## Project Structure
```
src/
├── models/          # Data entities (ProjectConfig, TaskState, etc.)
├── services/        # Business logic libraries
├── cli/            # CLI command implementations
└── lib/            # Core utilities

tests/
├── contract/       # API contract tests
├── integration/    # Integration tests
└── unit/          # Unit tests

specs/
└── 001-ai-model-switching/
    ├── spec.md
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/
```

## Commands
- `specify switch-model <target>`: Switch AI models without losing progress
- `specify list-models`: Show available AI models and compatibility
- `specify detect-project`: Auto-detect existing spec-kit projects
- `specify reset-project`: Clean project reset with backup
- `specify track-tasks <enable|disable|status>`: Manage task tracking UI

## Code Style
- Library-first architecture: Every feature as standalone library with CLI
- TDD mandatory: Tests written before implementation (RED-GREEN-Refactor)
- JSON for configuration, atomic file operations for reliability
- Terminal UI with graceful degradation for size constraints
- Structured logging and comprehensive error handling

## Recent Changes
- 001-ai-model-switching: Added AI model switching, project auto-detection, task tracking UI

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->