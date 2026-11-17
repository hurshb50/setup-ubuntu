import escapes from "ansi-escapes";
import styles from "ansi-styles";
import { stdin, stdout } from "process";
import readline from "readline";
import type { Package } from "../package/package";
import { renderBanner } from "../logger/logger";

export interface PackageOption {
    label: string;
    implementation: Package;
}

export async function selectPackages(
    options: PackageOption[],
    interactive = stdin.isTTY === true && stdout.isTTY === true,
): Promise<Package[] | undefined> {
    if (options.length === 0) return [];
    if (!interactive) return options.map(({ implementation }) => implementation);

    return promptForPackages(options);
}

export function getSelectedPackages(options: PackageOption[], selectedIndexes: ReadonlySet<number>): Package[] {
    return options.filter((_, index) => selectedIndexes.has(index)).map(({ implementation }) => implementation);
}

function promptForPackages(options: PackageOption[]): Promise<Package[] | undefined> {
    return new Promise((resolve) => {
        let activeIndex = 0;
        let renderedLineCount = 0;
        let finished = false;
        const selectedIndexes = new Set(options.map((_, index) => index));
        const previousRawMode = stdin.isRaw;

        const draw = (): void => {
            const keyHint = (key: string, action: string): string =>
                `${styles.cyan.open}${styles.bold.open}[${key}]${styles.bold.close}${styles.cyan.close} ${styles.dim.open}${action}${styles.dim.close}`;

            const legend = [
                keyHint("↑/↓", "Move"),
                keyHint("Space", "Toggle"),
                keyHint("A", "Toggle all"),
                keyHint("Enter", "Install"),
            ].join("   ");
            const lines = [
                ...renderBanner("Ubuntu Setup"),
                `${styles.dim.open}All components are selected by default.${styles.dim.close}`,
                legend,
                ...options.map(({ label }, index) => {
                    const pointer = index === activeIndex ? `${styles.blue.open}❯${styles.blue.close}` : " ";
                    const checkbox = selectedIndexes.has(index)
                        ? `${styles.green.open}[✓]${styles.green.close}`
                        : `${styles.dim.open}[ ]${styles.dim.close}`;
                    const optionLabel =
                        index === activeIndex ? `${styles.bold.open}${label}${styles.bold.close}` : label;
                    return `${pointer} ${checkbox} ${optionLabel}`;
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

        const finish = (packages: Package[] | undefined, message?: string): void => {
            if (finished) return;

            finished = true;
            cleanup();
            stdout.write(`${escapes.cursorUp(renderedLineCount)}\r${escapes.eraseDown}`);
            if (message) stdout.write(`\n${message}\n`);
            resolve(packages);
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
                if (selectedIndexes.has(activeIndex)) selectedIndexes.delete(activeIndex);
                else selectedIndexes.add(activeIndex);
                draw();
                return;
            }

            if (normalizedCharacter === "a") {
                if (selectedIndexes.size === options.length) selectedIndexes.clear();
                else options.forEach((_, index) => selectedIndexes.add(index));
                draw();
                return;
            }

            if (key.name === "return") {
                finish(getSelectedPackages(options, selectedIndexes));
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
