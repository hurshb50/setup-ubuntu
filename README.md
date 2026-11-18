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

In an interactive terminal, choose what to do with each component. All components start set to install.

- `[+]` installs or updates the component.
- `[-]` removes the component and its user data. It only appears for installed components that support removal.
- `[ ]` skips the component.

To reinstall a component from scratch, run the tool once to remove it, then again to install it.

- Use arrow keys to navigate.
- Press Space to change the action.
- Press A to install or skip all.
- Press Enter to continue.
- Press Escape to cancel.

Without an interactive terminal, all components install automatically.

Tools from earlier releases, like Google Chrome and the apt version of zoxide, are removed automatically.

## After Installation

Open a new terminal, then:

- Log out and back in to use Docker without `sudo`.
- Sign in to Zed, 1Password, and Brave.
- Run `gh auth login` to authenticate the GitHub CLI.
- Pick a wallpaper in HydraPaper.
- Put personal shell config in `~/.custom.bashrc`, not `~/.bashrc`.
- Update `/.gitconfig` if you are on work machine
