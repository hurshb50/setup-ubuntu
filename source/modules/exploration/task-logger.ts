import type { Task } from "./task";
import styles from "ansi-styles";
import escapes from "ansi-escapes";
import { setTimeout } from "timers/promises";
import { stdout } from "process";

export class TaskLogger {
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

    public async start(): Promise<void> {
        if (this.status !== "idle") throw new Error(`Cannot start task logger when status is '${this.status}'.`);

        this.status = "in-progress";
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
    }

    public stop(): void {
        if (this.status !== "in-progress") throw new Error(`Cannot start task logger when status is '${this.status}'.`);

        this.status = "done";
    }

    private write(): void {
        const dot = this.dot();

        for (const task of this.tasks) {
            this.reset(task);

            let leftLength = 0;

            if (task.status === "idle") this.padding(2);
            else if (task.status === "in-progress") this.log(dot);
            else this.log(TaskLogger.check);
            leftLength += 2;

            this.padding(2);
            this.log(task.name);
            leftLength += 2 + task.name.length;

            let rightLength = 0;

            if (task.step) rightLength += task.step.length;
            else if (task.error) rightLength += task.error.length;

            const centerLength = stdout.columns - rightLength - leftLength;
            this.padding(centerLength);

            if (task.step) this.log(task.step);
            else if (task.error) this.log(task.error);

            this.newline();
        }

        this.up(this.tasks.length);
    }

    private dot(): string {
        const dotIndex = this.tick % TaskLogger.dots.length;
        const dot = TaskLogger.dots[dotIndex];

        if (dot === undefined) {
            throw new Error(`Invalid index '${dotIndex}' to access dots of length '${TaskLogger.dots.length}'.`);
        }

        return dot;
    }

    private log(message: string): void {
        stdout.write(message);
    }

    private reset(task: Task): void {
        let color = styles.yellow.open;

        if (task.status === "done") color = styles.green.open;
        else if (task.status === "failed") color = styles.red.open;

        this.log(escapes.cursorLeft);
        this.log(escapes.eraseLine);
        this.log(color);
    }

    private padding(count = 0): void {
        this.log(" ".repeat(count));
    }

    private newline(count = 0): void {
        this.log("\n".repeat(count));
    }

    private up(count = 0): void {
        this.log(escapes.cursorUp(count));
    }
}
