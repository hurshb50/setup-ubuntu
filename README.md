# setup-ubuntu

Sets up a fresh Ubuntu machine with a standard set of tools, configuration, and dotfiles.

## Installation

```bash
sudo apt update && sudo apt install -y curl ca-certificates
curl -fsSL https://vite.plus | bash
vpx @hurshb50/setup-ubuntu
```

## Publishing

Run the `publish.yaml` workflow from the Actions tab, choosing `patch`, `minor`, or `major` for the version bump. CI checks, tests, builds, bumps the version, tags it, and stages the package on npm. It uses OIDC trusted publishing, so no npm token is needed.

Nothing goes live until you approve the staged package on npmjs.com under Staged Packages. The `release.yaml` workflow creates the GitHub release once the version is live.
