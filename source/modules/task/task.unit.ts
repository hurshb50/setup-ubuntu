import { describe, expect, test } from "vite-plus/test";
import { Task } from "./task";

describe("Task", () => {
    test("starts idle without a step", () => {
        const task = new Task("Browser");
        expect(task.name).toBe("Browser");
        expect(task.status).toBe("idle");
        expect(task.step).toBeUndefined();
    });

    test("moves from idle to in-progress on start", () => {
        const task = new Task("Browser");
        task.start();
        expect(task.status).toBe("in-progress");
        expect(task.step).toBeUndefined();
    });

    test("records the step on continue", () => {
        const task = new Task("Browser");
        task.start();
        task.continue("Update package manager");
        expect(task.step).toBe("Update package manager");
    });

    test("replaces the previous step on continue", () => {
        const task = new Task("Browser");
        task.start();
        task.continue("Update package manager");
        task.continue("Installing dependencies: gnupg");
        expect(task.step).toBe("Installing dependencies: gnupg");
    });

    test("clears the step and moves to done on finish", () => {
        const task = new Task("Browser");
        task.start();
        task.continue("Copy configuration");
        task.finish();
        expect(task.status).toBe("done");
        expect(task.step).toBeUndefined();
    });

    test("rejects start when already in-progress", () => {
        const task = new Task("Browser");
        task.start();
        expect(() => task.start()).toThrow("Cannot start task 'Browser' when status is 'in-progress'.");
        expect(task.status).toBe("in-progress");
    });

    test("rejects start when done", () => {
        const task = new Task("Browser");
        task.start();
        task.finish();
        expect(() => task.start()).toThrow("Cannot start task 'Browser' when status is 'done'.");
        expect(task.status).toBe("done");
    });

    test("rejects continue when idle", () => {
        const task = new Task("Browser");

        expect(() => task.continue("Update package manager")).toThrow(
            "Cannot update task 'Browser' step when status is 'idle'.",
        );

        expect(task.step).toBeUndefined();
    });

    test("rejects continue when done", () => {
        const task = new Task("Browser");
        task.start();
        task.finish();

        expect(() => task.continue("Copy configuration")).toThrow(
            "Cannot update task 'Browser' step when status is 'done'.",
        );

        expect(task.step).toBeUndefined();
    });

    test("rejects finish when idle", () => {
        const task = new Task("Browser");
        expect(() => task.finish()).toThrow("Cannot finish task 'Browser' when status is 'idle'.");
        expect(task.status).toBe("idle");
    });

    test("rejects finish when already done", () => {
        const task = new Task("Browser");
        task.start();
        task.finish();
        expect(() => task.finish()).toThrow("Cannot finish task 'Browser' when status is 'done'.");
        expect(task.status).toBe("done");
    });
});
