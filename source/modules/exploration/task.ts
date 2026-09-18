export class Task {
    name: string;
    status: "idle" | "in-progress" | "done";
    step?: string;

    constructor(name: string) {
        this.name = name;
        this.status = "idle";
        this.step = undefined;
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
        this.status = "done";
    }
}
