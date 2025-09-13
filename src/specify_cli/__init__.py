"""
hjLabs Specify CLI - AI Model Switching and Task Tracking

This is a Python wrapper that bridges to the Node.js implementation.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import typer
from rich.console import Console
from rich.panel import Panel

app = typer.Typer(help="AI Model Switching and Task Tracking CLI for Spec-Driven Development")
console = Console()

def get_node_cli_path():
    """Get the path to the Node.js CLI executable."""
    # Check if we're in the development directory
    current_dir = Path(__file__).parent.parent.parent
    node_cli = current_dir / "dist" / "cli" / "index.js"

    if node_cli.exists():
        return str(node_cli)

    # Check if node and npm are available
    if not shutil.which("node"):
        console.print("[red]Error: Node.js is not installed or not in PATH[/red]")
        console.print("Please install Node.js: https://nodejs.org/")
        return None

    if not shutil.which("npm"):
        console.print("[red]Error: npm is not installed or not in PATH[/red]")
        console.print("Please install npm (usually comes with Node.js)")
        return None

    return None

def run_node_cli(args):
    """Run the Node.js CLI with the given arguments."""
    node_cli = get_node_cli_path()

    if not node_cli:
        console.print("[red]Error: Could not find the Node.js CLI implementation[/red]")
        console.print("This might be a development environment issue.")
        return 1

    try:
        # Run the Node.js CLI with the provided arguments
        cmd = ["node", node_cli] + list(args)
        result = subprocess.run(cmd, check=False)
        return result.returncode
    except subprocess.CalledProcessError as e:
        console.print(f"[red]Error running CLI: {e}[/red]")
        return 1
    except FileNotFoundError:
        console.print("[red]Error: Node.js is not installed or not in PATH[/red]")
        return 1

@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    version: bool = typer.Option(False, "--version", "-v", help="Show version"),
):
    """Main entry point for the CLI."""
    if version:
        console.print("hjLabs Specify CLI v0.1.0")
        return

    if ctx.invoked_subcommand is None:
        # If no subcommand, pass all arguments to Node.js CLI
        args = sys.argv[1:]  # Remove script name
        exit_code = run_node_cli(args)
        sys.exit(exit_code)

@app.command()
def switch_model(
    target: str = typer.Argument(help="Target AI model to switch to"),
    ctx: typer.Context = typer.Option(None)
):
    """Switch AI models without losing progress."""
    args = ["switch-model", target]
    exit_code = run_node_cli(args)
    sys.exit(exit_code)

@app.command()
def list_models():
    """Show available AI models and compatibility."""
    exit_code = run_node_cli(["list-models"])
    sys.exit(exit_code)

@app.command()
def detect_project():
    """Auto-detect existing spec-kit projects."""
    exit_code = run_node_cli(["detect-project"])
    sys.exit(exit_code)

@app.command()
def reset_project():
    """Clean project reset with backup."""
    exit_code = run_node_cli(["reset-project"])
    sys.exit(exit_code)

@app.command()
def track_tasks(
    action: str = typer.Argument(help="Action: enable|disable|status")
):
    """Manage task tracking UI."""
    exit_code = run_node_cli(["track-tasks", action])
    sys.exit(exit_code)

def main():
    """Entry point for the CLI when called via uvx."""
    app()

if __name__ == "__main__":
    main()