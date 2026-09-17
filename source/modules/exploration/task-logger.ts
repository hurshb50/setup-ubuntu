import crypto from "crypto";

export class TaskLogger {
    tasks: Map<crypto.UUID, Task>;
    timeout?: NodeJS.Timeout;
    spinnerFrame: number;

    constructor() {
        this.tasks = new Map();
        this.timeout = undefined;
        this.spinnerFrame = 0;
    }

    registerTask(partialTask: Pick<Task, "name" | "header">): crypto.UUID {
        const taskId = crypto.randomUUID();

        const task: Task = {
            ...partialTask,
            status: "idle",
            row: this.tasks.size,
            step: undefined,
        };

        this.tasks.set(taskId, task);
        return taskId;
    }

    startTask(taskId: crypto.UUID): void {
        const task = this.tasks.get(taskId);

        if (task === undefined) throw new Error(`Task with id '${taskId}' does not exist.`);

        if (task.status !== "idle") {
            throw new Error(`Cannot start task state '${task.name}' when status is ${task.status}.`);
        }

        task.status = "in-progress";
    }

    finishTask(taskId: crypto.UUID): void {
        const task = this.tasks.get(taskId);

        if (task === undefined) throw new Error(`Task with id '${taskId}' does not exist.`);

        if (task.status !== "in-progress") {
            throw new Error(`Cannot finish task state '${task.name}' when status is ${task.status}.`);
        }

        task.step = undefined;
        task.status = "done";
    }

    updateTaskStep(taskId: crypto.UUID, step: string): void {
        const task = this.tasks.get(taskId);

        if (task === undefined) throw new Error(`Task with id '${taskId}' does not exist.`);

        if (task.status !== "in-progress") {
            throw new Error(`Cannot update step for task state '${task.name}' when status is ${task.status}.`);
        }

        task.step = step;
    }

    start(): void {
        this.timeout = setInterval(() => this.printTasks(), 80);
    }

    stop(): void {
        if (!this.timeout) throw new Error("Logger has not been started.");

        clearInterval(this.timeout);
    }

    log(message: string): void {
        process.stdout.write(message);
    }

    private printTasks(): void {
        const dots = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

        const tasks = this.tasks
            .values()
            .toArray()
            .toSorted((taskA, taskB) => taskA.row - taskB.row);

        const up = (rows = 1) => `\x1b[${rows}A`;
        const start = "\r";
        const clear = "\x1b[2K";
        const newline = "\n";
        const padding = (size = 1) => " ".repeat(size - 1);
        const check = "✔";
        const dot = dots[this.spinnerFrame];

        if (dot === undefined) {
            throw new Error(`Invalid index '${this.spinnerFrame}' to access dots of length '${dots.length}'.`);
        }

        for (const task of tasks) {
            this.log(start);
            this.log(clear);
            this.log(padding(2));

            if (task.status === "idle") this.log(padding(2));
            else if (task.status === "in-progress") this.log(dot);
            else this.log(check);

            this.log(padding(2));
            this.log(task.header);
            this.log(padding(10));

            if (task.step) this.log(task.step);

            this.log(newline);
        }

        this.log(up(tasks.length));
        this.spinnerFrame = (this.spinnerFrame + 1) % dots.length;
    }
}

interface Task {
    status: "idle" | "in-progress" | "done";
    name: string;
    header: string;
    row: number;
    step?: string;
}
