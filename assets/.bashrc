function is_interactive() {
    [[ $- == *i* ]]
}

function check_command() {
    command -v "$1" &> /dev/null
}

function path_exists() {
    if [ -e "$1" ]; then
        return 0
    else
        return 1
    fi
}

function is_posix() {
    shopt -oq posix
}

function print_error() {
    local RED='\033[0;31m'
    local NC='\033[0m'
    echo -e "\n${RED} $1 ${NC}"
    echo -e "\n${RED} Run the setup script to fix this.${NC}"
}

function path() {
    export PATH="$HOME/.local/bin:$PATH"
}

function setup_history() {
    shopt -s histappend
    shopt -s checkwinsize
}

function completion() {
    if is_posix; then
        return
    fi

    USER_COMPLETION_PATH="/usr/share/bash-completion/bash_completion"

    if path_exists "${USER_COMPLETION_PATH}"; then
        . "${USER_COMPLETION_PATH}"
    fi
}

function terminal_view() {
    if ! check_command "oh-my-posh"; then
        print_error "'oh-my-posh' is not installed"
        return 1
    fi

    eval "$(oh-my-posh init bash --config $HOME/.config/oh-my-posh/oh-my-posh.toml)"
}

function smart_change_directory() {
    if ! check_command "zoxide"; then
        print_error "'zoxide' is not installed"
        return 1
    fi

    eval "$(zoxide init bash --cmd cd)"
}

function list_directory_alias() {
    alias ls="ls -lAh --color=auto"
}

function custom_bash_rc() {
    CUSTOM_BASH_RC_PATH="${HOME}/custom.bashrc"

    if ! path_exists "${CUSTOM_BASH_RC_PATH}"; then
        return
    fi

    source "${CUSTOM_BASH_RC_PATH}"
}

function disable_legacy() {
    stty -ixon
}

function swap_capslock_and_esc() {
    gsettings set org.gnome.desktop.input-sources xkb-options "['caps:swapescape']"
}

function load_auto_suggestion() {
    BLE_PATH="$HOME/.local/share/blesh/ble.sh"

    if ! path_exists "$BLE_PATH"; then
        print_error "'ble.sh' is not installed"
        return 1
    fi

    source "$BLE_PATH" --attach=none
}

function start_auto_suggestion() {
    if ! check_command "ble-attach"; then
        print_error "ble-attach is not installed"
        return 1
    fi

    ble-attach
    clear
}

function fuzzy_finder() {
    if ! check_command "fzf"; then
        print_error "'fzf' is not installed"
        return 1
    fi

    FZF_KEY_BINDINGS="/usr/share/doc/fzf/examples/key-bindings.bash"
    FZF_COMPLETION="/usr/share/bash-completion/completions/fzf"

    if path_exists "$FZF_KEY_BINDINGS"; then
        source "$FZF_KEY_BINDINGS"
    fi

    if path_exists "$FZF_COMPLETION"; then
        source "$FZF_COMPLETION"
    fi
}

function run() {
    if ! is_interactive; then
        return
    fi

    path
    load_auto_suggestion
    setup_history
    completion
    terminal_view
    smart_change_directory
    list_directory_alias
    custom_bash_rc
    disable_legacy
    swap_capslock_and_esc
    fuzzy_finder
    start_auto_suggestion
}

run
