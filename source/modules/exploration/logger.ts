import type { Task } from "./task";
import styles from "ansi-styles";
import escapes from "ansi-escapes";
import { setTimeout } from "timers/promises";
import { stdout } from "process";

export class Logger {
    status: "idle" | "in-progress" | "done";
    private tasks: Task[];
    private tick: number;
    private static check = "✔";
    private static dots = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

    constructor() {
        this.status = "idle";
        this.tasks = [];
        this.tick = 0;
    }

    public add(task: Task): void {
        this.tasks.push(task);
    }

    public start(): void {
        if (this.status !== "idle") throw new Error(`Cannot start task logger when status is '${this.status}'.`);

        this.status = "in-progress";
        void this.loop();
    }

    public stop(): void {
        if (this.status !== "in-progress") throw new Error(`Cannot start task logger when status is '${this.status}'.`);

        this.status = "done";
    }

    private async loop(): Promise<void> {
        const minimumIntervalMilliSeconds = 80;

        while (this.status === "in-progress") {
            const start = performance.now();
            this.write();
            const end = performance.now();
            const elapsedTime = end - start;
            const remainingTime = minimumIntervalMilliSeconds - elapsedTime;
            await setTimeout(remainingTime);
            this.tick += 1;
        }

        this.write();
        this.newline(this.tasks.length);
    }

    private write(): void {
        if (this.status === "idle") throw new Error("Cannot write to stdout if status is 'idle'.");

        const columns = stdout.columns ?? 120;

        for (const [taskIndex, task] of this.tasks.entries()) {
            const width = columns - 1;
            const leftText = task.name;
            const rightText = task.step ?? "";
            this.reset(task);
            this.icon(task);
            this.padding(2);
            this.log(leftText);
            const centerPadding = Math.max(1, width - (2 + 2 + leftText.length + rightText.length));
            this.padding(centerPadding);
            this.log(rightText);

            if (taskIndex !== this.tasks.length - 1) this.down(1);
        }

        if (this.tasks.length > 1) this.up(this.tasks.length - 1);
    }

    private dot(): void {
        const dotIndex = this.tick % Logger.dots.length;
        const dot = Logger.dots[dotIndex];

        if (dot === undefined) {
            throw new Error(`Invalid index '${dotIndex}' to access dots of length '${Logger.dots.length}'.`);
        }

        this.log(dot);
    }

    private log(message: string): void {
        stdout.write(message);
    }

    private reset(task: Task): void {
        let color = styles.yellow.open;

        if (task.status === "done") color = styles.green.open;

        this.log(escapes.cursorLeft);
        this.log(escapes.eraseLine);
        this.log(color);
    }

    private icon(task: Task): void {
        if (task.status === "idle") this.padding(2);
        else if (task.status === "in-progress") this.dot();
        else this.log(Logger.check);
    }

    private padding(count = 1): void {
        this.log(" ".repeat(count));
    }

    private newline(count = 1): void {
        this.log("\n".repeat(count));
    }

    private up(count = 1): void {
        this.log(escapes.cursorUp(count));
    }

    private down(count = 1): void {
        this.log(escapes.cursorDown(count));
    }
}
