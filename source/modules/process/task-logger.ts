import crypto from "crypto";

export class TaskLogger {
    tasks: Map<crypto.UUID, Task>;
    timeout?: NodeJS.Timeout;

    constructor() {
        this.tasks = new Map();
        this.timeout = undefined;
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

    private printTasks(): void {}
}

interface Task {
    status: "idle" | "in-progress" | "done";
    name: string;
    header: string;
    row: number;
    step?: string;
}
