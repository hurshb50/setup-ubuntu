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

## After Installation

Open a new terminal, then:

- Log out and back in to use Docker without `sudo`.
- Sign in to Zed, 1Password, and Brave.
- Run `gh auth login` to authenticate the GitHub CLI.
- Pick a wallpaper in HydraPaper.
- Put personal shell config in `~/.custom.bashrc`, not `~/.bashrc`.
- Update `/.gitconfig` if you are on work machine

## Removing Chrome

The setup installs Brave and leaves Chrome untouched. To remove Chrome completely, run:

```bash
dpkg-query -W -f='${Package}\n' 'google-chrome-*' | xargs -r sudo apt-get purge -y

sudo rm -rf \
    /etc/apt/sources.list.d/google-chrome.list \
    /etc/apt/sources.list.d/google-chrome.sources \
    /etc/apt/trusted.gpg.d/google-chrome.gpg \
    /usr/share/keyrings/google-chrome.gpg \
    /etc/opt/chrome \
    /opt/google/chrome \
    /usr/share/applications/google-chrome.desktop \
    /usr/share/applications/google-chrome-beta.desktop \
    /usr/share/applications/google-chrome-unstable.desktop

rm -rf \
    ~/.config/google-chrome \
    ~/.cache/google-chrome \
    ~/.config/google-chrome-beta \
    ~/.cache/google-chrome-beta \
    ~/.config/google-chrome-unstable \
    ~/.cache/google-chrome-unstable
```

This deletes Chrome profiles and caches. Back them up first if needed.

## Removing Firefox

This removes Firefox from Snap, APT, or Flatpak installs. It also deletes local profiles and caches.

```bash
if command -v snap >/dev/null 2>&1 && snap list firefox >/dev/null 2>&1; then
    sudo snap remove --purge firefox
fi

dpkg-query -W -f='${db:Status-Status} ${binary:Package}\n' 'firefox*' 2>/dev/null |
    awk '$1 == "installed" { print $2 }' |
    xargs -r sudo apt-get purge -y

if command -v flatpak >/dev/null 2>&1 &&
    flatpak info org.mozilla.firefox >/dev/null 2>&1; then
    flatpak uninstall --delete-data -y org.mozilla.firefox
fi

rm -rf \
    "$HOME/.mozilla/firefox" \
    "$HOME/.cache/mozilla/firefox" \
    "$HOME/snap/firefox" \
    "$HOME/.var/app/org.mozilla.firefox"
```
