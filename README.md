# setup-ubuntu

Sets up a fresh Ubuntu machine with tools, configuration, and dotfiles.

## Installation

```bash
sudo apt update && sudo apt install -y curl ca-certificates
curl -fsSL https://vite.plus | bash
vpx @hurshb50/setup-ubuntu
```

## After Installation

Open a new terminal, then:

- Log out and back in to use Docker without `sudo`.
- Sign in to Zed, 1Password, and Chrome.
- Pick a wallpaper in HydraPaper.
- Put personal shell config in `~/custom.bashrc`, not `~/.bashrc`.

## Publishing

1. Run `publish.yaml` from the Actions tab with a `patch`, `minor`, or `major` bump. CI checks, tests, builds, tags, and stages the package, using OIDC instead of a token.
2. Approve the staged package on npmjs.com to publish it.
3. `release.yaml` creates the GitHub release once the version is live.
