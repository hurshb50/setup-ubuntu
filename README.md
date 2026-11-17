# setup-ubuntu

Sets up a fresh Ubuntu machine with tools, configuration, and dotfiles.

## Installation

```bash
sudo apt update
sudo apt install -y curl ca-certificates
curl -fsSL https://vite.plus | bash
vpx @hurshb50/setup-ubuntu@latest
```

Vite+ defaults to pnpm, which can hold back freshly published releases. The setup pins npm globally, so later commands need no prefix.

## Choosing Components

In an interactive terminal, choose which components to install. All components start selected.

- Use arrow keys to navigate.
- Press Space to toggle selection.
- Press A to select or clear all.
- Press Enter to continue.
- Press Escape to cancel.

Without an interactive terminal, all components install automatically.

## After Installation

Open a new terminal, then:

- Log out and back in to use Docker without `sudo`.
- Sign in to Zed, 1Password, and Brave.
- Run `gh auth login` to authenticate the GitHub CLI.
- Pick a wallpaper in HydraPaper.
- Put personal shell config in `~/.custom.bashrc`, not `~/.bashrc`.
- Update `/.gitconfig` if you are on work machine
