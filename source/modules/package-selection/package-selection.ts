import escapes from "ansi-escapes";
import styles from "ansi-styles";
import { stdin, stdout } from "process";
import readline from "readline";
import { isRemovable, type InstallContext, type Package, type RemovablePackage } from "../package/package";
import { renderBanner } from "../logger/logger";

export type Action = "install" | "uninstall" | "skip";

export interface PackageOption {
    label: string;
    implementation: Package;
}

export interface PackageSelection {
    install: Package[];
    uninstall: RemovablePackage[];
}

export async function selectPackages(
    options: PackageOption[],
    context: InstallContext,
    interactive = stdin.isTTY === true && stdout.isTTY === true,
): Promise<PackageSelection | undefined> {
    const defaultActions = options.map((): Action => "install");
    if (!interactive || options.length === 0) return getSelection(options, defaultActions);

    const installed = await Promise.all(options.map(({ implementation }) => implementation.isInstalled(context)));
    return promptForPackages(options, installed);
}

export function getAvailableActions(implementation: Package, installed: boolean): Action[] {
    return installed && isRemovable(implementation) ? ["install", "uninstall", "skip"] : ["install", "skip"];
}

export function getNextAction(action: Action, availableActions: readonly Action[]): Action {
    const index = availableActions.indexOf(action);
    return availableActions[(index + 1) % availableActions.length] ?? "install";
}

export function toggleAllActions(actions: readonly Action[]): Action[] {
    const action: Action = actions.every((current) => current === "install") ? "skip" : "install";
    return actions.map(() => action);
}

export function getSelection(options: PackageOption[], actions: readonly Action[]): PackageSelection {
    const selection: PackageSelection = { install: [], uninstall: [] };

    options.forEach(({ implementation }, index) => {
        const action = actions[index];

        if (action === "install") selection.install.push(implementation);
        else if (action === "uninstall" && isRemovable(implementation)) selection.uninstall.push(implementation);
    });

    return selection;
}

const marks: Record<Action, string> = {
    install: `${styles.green.open}[+]${styles.green.close}`,
    uninstall: `${styles.red.open}[-]${styles.red.close}`,
    skip: `${styles.dim.open}[ ]${styles.dim.close}`,
};

function promptForPackages(
    options: PackageOption[],
    installed: readonly boolean[],
): Promise<PackageSelection | undefined> {
    return new Promise((resolve) => {
        let activeIndex = 0;
        let renderedLineCount = 0;
        let finished = false;
        let actions = options.map((): Action => "install");
        const availableActions = options.map(({ implementation }, index) =>
            getAvailableActions(implementation, installed[index] === true),
        );
        const labelWidth = Math.max(...options.map(({ label }) => label.length));
        const previousRawMode = stdin.isRaw;

        const draw = (): void => {
            const keyHint = (key: string, action: string): string =>
                `${styles.cyan.open}${styles.bold.open}[${key}]${styles.bold.close}${styles.cyan.close} ${styles.dim.open}${action}${styles.dim.close}`;

            const legend = [
                keyHint("↑/↓", "Move"),
                keyHint("Space", "Change"),
                keyHint("A", "Toggle all"),
                keyHint("Enter", "Run"),
            ].join("   ");
            const markLegend = [
                `${marks.install} Install`,
                `${marks.uninstall} Remove, including data`,
                `${marks.skip} Skip`,
            ].join("   ");
            const lines = [
                ...renderBanner("Ubuntu Setup"),
                `${styles.dim.open}${markLegend}${styles.dim.close}`,
                legend,
                ...options.map(({ label }, index) => {
                    const pointer = index === activeIndex ? `${styles.blue.open}❯${styles.blue.close}` : " ";
                    const mark = marks[actions[index] ?? "install"];
                    const paddedLabel = label.padEnd(labelWidth);
                    const optionLabel =
                        index === activeIndex ? `${styles.bold.open}${paddedLabel}${styles.bold.close}` : paddedLabel;
                    const status = installed[index] ? `   ${styles.dim.open}installed${styles.dim.close}` : "";
                    return `${pointer} ${mark} ${optionLabel}${status}`;
                }),
            ];

            if (renderedLineCount > 0) {
                stdout.write(`${escapes.cursorUp(renderedLineCount - 1)}\r`);
            }

            lines.forEach((line, index) => {
                stdout.write(`${escapes.eraseLine}${line}`);
                if (index < lines.length - 1) stdout.write("\n");
            });

            renderedLineCount = lines.length;
        };

        const cleanup = (): void => {
            stdin.off("keypress", onKeypress);
            stdin.setRawMode(previousRawMode);
            stdin.pause();
        };

        const finish = (selection: PackageSelection | undefined, message?: string): void => {
            if (finished) return;

            finished = true;
            cleanup();
            stdout.write(`${escapes.cursorUp(renderedLineCount)}\r${escapes.eraseDown}`);
            if (message) stdout.write(`\n${message}\n`);
            resolve(selection);
        };

        const onKeypress = (character: string, key: { name?: string; ctrl?: boolean }): void => {
            if (key.ctrl && key.name === "c") {
                process.exitCode = 130;
                finish(undefined);
                return;
            }

            if (key.name === "escape") {
                finish(undefined, "Selection cancelled.");
                return;
            }

            const normalizedCharacter = character?.toLowerCase();

            if (key.name === "up" || normalizedCharacter === "k") {
                activeIndex = (activeIndex - 1 + options.length) % options.length;
                draw();
                return;
            }

            if (key.name === "down" || normalizedCharacter === "j") {
                activeIndex = (activeIndex + 1) % options.length;
                draw();
                return;
            }

            if (key.name === "space" || character === " ") {
                actions = actions.map((action, index) =>
                    index === activeIndex ? getNextAction(action, availableActions[index] ?? []) : action,
                );
                draw();
                return;
            }

            if (normalizedCharacter === "a") {
                actions = toggleAllActions(actions);
                draw();
                return;
            }

            if (key.name === "return") {
                finish(getSelection(options, actions));
            }
        };

        readline.emitKeypressEvents(stdin);
        stdin.setRawMode(true);
        stdin.on("keypress", onKeypress);
        stdin.resume();
        stdout.write("\n");
        draw();
    });
}
