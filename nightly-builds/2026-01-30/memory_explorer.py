# memory_explorer.py
# A Textual TUI for browsing, searching, and visualizing connections within memory files.
# This tool helps in identifying patterns and relationships in the knowledge base.

import re
from pathlib import Path

from textual.app import App, ComposeResult
from textual.containers import Container, Vertical
from textual.reactive import var
from textual.widgets import (
    DirectoryTree,
    Footer,
    Header,
    Input,
    ListItem,
    ListView,
    Markdown,
    Static,
)
from textual.worker import work

# The user's project structure shows the 'memory' directory at the root.
# This relative path should work correctly when the script is run from the project root.
MEMORY_DIR = Path("./memory")


class MemoryTree(DirectoryTree):
    """A DirectoryTree that only shows markdown files."""
    def filter_paths(self, paths):
        # This function is used by the DirectoryTree to filter which files and directories are shown.
        # We want to see directories (so we can traverse them) and markdown files.
        # We also hide hidden files/directories (those starting with a dot).
        for path in paths:
            if not path.name.startswith('.') and (path.is_dir() or path.suffix == '.md'):
                yield path


class MemoryExplorerApp(App):
    """A Textual application to explore and search memory files."""

    CSS_PATH = "explorer.css"
    TITLE = "Memory Explorer"

    # Key bindings for the application.
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("f", "toggle_files", "Toggle Files"),
        ("/", "focus_search", "Search"),
        ("escape", "clear_search", "Clear Search / Focus Files"),
    ]

    # Reactive variable to control the visibility of the file browser panel.
    show_file_browser = var(True)

    def watch_show_file_browser(self, show: bool) -> None:
        """
        Called when the `show_file_browser` reactive variable changes.
        This will add or remove the '-hidden' class to the file list container.
        """
        self.query_one("#file-list-container").set_class(not show, "-hidden")

    def compose(self) -> ComposeResult:
        """
        Create child widgets for the app. This method is called once when the app is mounted.
        """
        yield Header()
        with Container(id="app-grid"):
            # The left panel for file navigation and search results.
            with Vertical(id="file-list-container"):
                yield MemoryTree(str(MEMORY_DIR), id="file-list")
                yield ListView(id="search-results-list", classes="-hidden")
            # The right panel for displaying content and links.
            with Vertical(id="content-container"):
                yield Static("Select a file to view its content.", id="content-header")
                yield Markdown(id="content-view")
                yield Static(id="links-view", classes="-hidden")
        yield Input(placeholder="Search content...", id="search-input")
        yield Footer()

    def on_mount(self) -> None:
        """Called when app is first mounted. Checks for memory directory and focuses file list."""
        if not MEMORY_DIR.is_dir():
            self.query_one("#content-header").update("[bold red]Error: Memory directory not found.[/]")
            self.query_one("#content-view").update(
                f"The directory '{MEMORY_DIR.resolve()}' does not exist. "
                "Please ensure you are running this tool from the correct project root "
                "and the 'memory' directory exists."
            )
            self.query_one("#file-list").add_class("-hidden")
        else:
            self.query_one("#file-list").focus()

    def on_directory_tree_file_selected(self, event: DirectoryTree.FileSelected) -> None:
        """
        Called when a file is selected in the DirectoryTree.
        Loads the file's content into the Markdown viewer.
        """
        event.stop()
        self.update_content_view(event.path)

    async def on_list_view_selected(self, event: ListView.Selected) -> None:
        """
        Called when a search result is selected from the ListView.
        Loads the file's content into the Markdown viewer.
        """
        event.stop()
        # The `name` attribute of the ListItem stores the full path to the file.
        if event.list_view.id == "search-results-list" and event.item.name:
            file_path = Path(event.item.name)
            self.update_content_view(file_path)

    def update_content_view(self, file_path: Path) -> None:
        """Helper to load and display a file's content and its links."""
        try:
            content = file_path.read_text(encoding="utf-8")
            try:
                display_path = file_path.relative_to(Path.cwd())
            except ValueError:
                display_path = file_path
            
            self.query_one("#content-header").update(f"[bold]{display_path}[/]")
            self.query_one("#content-view", Markdown).update(content)
            self.update_links_view(file_path, content)
            self.query_one("#links-view").remove_class("-hidden")

        except Exception as e:
            self.query_one("#content-header").update(f"[bold red]Error reading file[/]")
            self.query_one("#content-view", Markdown).update(f"Could not read file: {e}")
            self.query_one("#links-view").add_class("-hidden")

    def update_links_view(self, file_path: Path, content: str) -> None:
        """
        Update the links view with outgoing and incoming links (backlinks).
        This is a core feature for visualizing connections via [[wikilinks]].
        """
        links_view = self.query_one("#links-view", Static)

        # 1. Find outgoing links in the current file using regex.
        outgoing_links = set(re.findall(r"\[\[(.*?)\]\]", content))

        # 2. Find incoming links (backlinks) by searching all other memory files.
        # This could be slow on large memory stores, but is simple. An index would be faster.
        incoming_links = set()
        target_name = file_path.stem
        for md_file in MEMORY_DIR.rglob("*.md"):
            if md_file.samefile(file_path):
                continue
            try:
                file_content = md_file.read_text(encoding="utf-8")
                if f"[[{target_name}]]" in file_content:
                    incoming_links.add(md_file.stem)
            except Exception:
                continue

        # 3. Format the links for display in the Static widget.
        display_parts = []
        if outgoing_links:
            links_str = "\n".join(f"- {link}" for link in sorted(list(outgoing_links)))
            display_parts.append(f"[bold]Outgoing Links:[/]\n{links_str}")
        if incoming_links:
            links_str = "\n".join(f"- {link}" for link in sorted(list(incoming_links)))
            display_parts.append(f"[bold]Incoming Links (Backlinks):[/]\n{links_str}")
        
        links_view.update("\n\n".join(display_parts) or "[dim]No links found.[/dim]")

    # --- Actions and Event Handlers ---

    def action_toggle_files(self) -> None:
        """Called by key binding 'f'. Toggles the file browser panel."""
        self.show_file_browser = not self.show_file_browser

    def action_focus_search(self) -> None:
        """Called by key binding '/'. Focuses the search input."""
        self.query_one("#search-input").focus()

    def action_clear_search(self) -> None:
        """Called by 'escape'. Clears search and returns to file browser."""
        self.query_one("#search-input").value = ""
        self.run_search("")

    async def on_input_submitted(self, event: Input.Submitted) -> None:
        """Called when enter is pressed in the search input."""
        self.run_search(event.value)

    @work(exclusive=True)
    async def run_search(self, search_term: str) -> None:
        """
        A background worker to perform search without blocking the UI.
        `exclusive=True` ensures only one search runs at a time.
        """
        tree_view = self.query_one("#file-list")
        results_view = self.query_one("#search-results-list", ListView)
        
        if not search_term.strip():
            # If search is cleared, show the file tree and hide results.
            self.call_from_thread(results_view.add_class, "-hidden")
            self.call_from_thread(tree_view.remove_class, "-hidden")
            self.call_from_thread(tree_view.focus)
            return

        # When searching, hide the tree and show the results list.
        self.call_from_thread(tree_view.add_class, "-hidden")
        self.call_from_thread(results_view.remove_class, "-hidden")
        await self.call_from_thread(results_view.clear)

        found_count = 0
        for md_file in MEMORY_DIR.rglob("*.md"):
            try:
                # First, check the filename
                if search_term.lower() in md_file.name.lower():
                    item = ListItem(Static(f"{md_file.name} [dim][match: name][/]"), name=str(md_file))
                    self.call_from_thread(results_view.append, item)
                    found_count += 1
                    continue

                # Then, check the content
                content = md_file.read_text(encoding="utf-8")
                if search_term.lower() in content.lower():
                    item = ListItem(Static(f"{md_file.name} [dim][match: content][/]"), name=str(md_file))
                    self.call_from_thread(results_view.append, item)
                    found_count += 1
            except Exception:
                continue
        
        header = self.query_one("#content-header")
        if found_count > 0:
            msg = f"Found {found_count} results for '[bold]{search_term}[/]'. Select one to view."
            self.call_from_thread(header.update, msg)
            self.call_from_thread(results_view.focus)
        else:
            msg = f"No results found for '[bold]{search_term}[/]'."
            self.call_from_thread(header.update, msg)

if __name__ == "__main__":
    app = MemoryExplorerApp()
    app.run()
