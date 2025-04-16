import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TaskHandler } from "./task.handler.js";

describe("TaskHandler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialise with valid parameters", () => {
    const queueState = ["task1", "task2"];
    const limit = 5;
    const intervalMs = 1000;

    const handler = new TaskHandler(queueState, limit, intervalMs);

    expect(handler.limit).toBe(limit);
    expect(handler.intervalMs).toBe(intervalMs);
    expect(handler.count).toBe(0);
    expect(handler.lastStartMs).toBe(0);
    expect(handler.queue).toBeDefined();
  });

  it("should throw for non-integer limit", () => {
    const queueState = ["task1"];
    const limit = 3.5;
    const intervalMs = 1000;
    expect(() => new TaskHandler(queueState, limit, intervalMs)).toThrow();
  });

  it("should throw for non-positive limit", () => {
    const queueState = ["task1"];
    const limit = 0;
    const intervalMs = 1000;
    expect(() => new TaskHandler(queueState, limit, intervalMs)).toThrow();
  });

  it("should throw for negative interval", () => {
    const queueState = ["task1"];
    const limit = 5;
    const intervalMs = -100;
    expect(() => new TaskHandler(queueState, limit, intervalMs)).toThrow();
  });

  it("should call task and update count and lastStartMs with .add()", async () => {
    const mockTask = vi.fn().mockResolvedValue("result");
    const nowMs = 1234567890;
    vi.setSystemTime(nowMs);

    const queueState = ["task1"];
    const handler = new TaskHandler(queueState, 5, 1000);

    handler.add(mockTask);

    expect(handler.count).toBe(1);
    expect(handler.lastStartMs).toBe(nowMs);
    expect(mockTask).toHaveBeenCalledWith("task1");

    // wait for add() promise to resolve
    await vi.runAllTimersAsync();

    expect(handler.count).toBe(0);
  });

  it("should handle task errors", async () => {
    const mockTask = vi.fn().mockRejectedValue(new Error("test error"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const queueState = ["task1"];
    const handler = new TaskHandler(queueState, 5, 1000);

    handler.add(mockTask);

    // wait for add() promise to resolve
    await vi.runAllTimersAsync();

    expect(consoleSpy).toHaveBeenCalledWith("error crawling: 'test error'");
    expect(handler.count).toBe(0);
  });

  it("should delay remaining time if needed", async () => {
    const handler = new TaskHandler([], 5, 1000);

    const delaySpy = vi.spyOn(handler, "delayMs").mockResolvedValue(undefined);
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const nowMs = 1000;
    vi.setSystemTime(nowMs);

    handler["_lastStartMs"] = 500;
    await handler.delayRemainingMs(nowMs);

    expect(delaySpy).toHaveBeenCalledWith(500);
    expect(consoleSpy).toHaveBeenCalledWith("delaying by remaining 500ms of 1000 interval");
  });

  it("should not delay if interval already passed", async () => {
    const handler = new TaskHandler([], 5, 1000);
    const delaySpy = vi.spyOn(handler, "delayMs").mockResolvedValue(undefined);
    const nowMs = 2000;
    vi.setSystemTime(nowMs);

    handler["_lastStartMs"] = 500;
    await handler.delayRemainingMs(nowMs);

    expect(delaySpy).not.toHaveBeenCalled();
  });

  it("should delay specified ms", async () => {
    const handler = new TaskHandler([], 5, 1000);
    const delayPromise = handler.delayMs(500);

    await vi.advanceTimersByTimeAsync(500);

    await expect(delayPromise).resolves.toBeUndefined();
  });
});
