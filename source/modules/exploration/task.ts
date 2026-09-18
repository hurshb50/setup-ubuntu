export class Task {
    name: string;
    status: "idle" | "in-progress" | "done" | "failed";
    step?: string;
    error?: string;

    constructor(name: string) {
        this.name = name;
        this.status = "idle";
        this.step = undefined;
        this.error = undefined;
    }

    start(): void {
        if (this.status !== "idle") {
            throw new Error(`Cannot start task '${this.name}' when status is '${this.status}'.`);
        }

        this.status = "in-progress";
    }

    continue(step: string): void {
        if (this.status !== "in-progress") {
            throw new Error(`Cannot update task '${this.name}' step when status is '${this.status}'.`);
        }

        this.step = step;
    }

    finish(): void {
        if (this.status !== "in-progress") {
            throw new Error(`Cannot finish task '${this.name}' when status is '${this.status}'.`);
        }

        this.step = undefined;
        this.error = undefined;
        this.status = "done";
    }

    fail(error: unknown): void {
        if (this.status !== "in-progress") {
            throw new Error(`Cannot fail task '${this.name}' when status is '${this.status}'.`);
        }

        this.step = undefined;
        this.error = Task.message(error);
        this.status = "failed";
    }

    private static message(error: unknown): string {
        if (error instanceof Error) return error.message;
        if (typeof error === "string") return error;

        return String(error);
    }
}
