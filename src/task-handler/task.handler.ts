import { z } from "zod";
import { QueueHandler } from "../queue-handler/queue.handler.js";

const limitAssert = z.number().int("expected integer").positive("expected positive");
const intervalAssert = z.number().int("expected integer").nonnegative("expected non-negative");

export class TaskHandler {
  private _queue: QueueHandler;
  private _limit: number;
  private _count: number = 0;
  private _intervalMs: number;
  private _lastStartMs: number = 0;

  constructor(queueState: string[], limit: number, intervalMs: number) {
    try {
      limitAssert.parse(limit);
      intervalAssert.parse(intervalMs);
    } catch (error: any) {
      throw new Error(`task handler invalid input: ${error?.message || error}`);
    }
    this._queue = new QueueHandler(queueState);
    this._limit = limit;
    this._intervalMs = intervalMs;
  }

  //

  get queue() {
    return this._queue;
  }
  get limit() {
    return this._limit;
  }
  get count() {
    return this._count;
  }
  get intervalMs() {
    return this._intervalMs;
  }
  get lastStartMs() {
    return this._lastStartMs;
  }

  //

  public add(task: (args: any) => Promise<unknown>) {
    const nowMs = Date.now();

    const message = this._queue.shift() as string;
    this._count += 1;
    this._lastStartMs = nowMs;

    task(message)
      .catch((error: any) => console.error(`error crawling: '${error?.message || error}'`))
      .finally(() => (this._count -= 1));
  }

  //

  public async delayRemainingMs(nowMs: number) {
    const diff = this._intervalMs - (nowMs - this._lastStartMs);
    if (diff > 0) {
      console.warn(`delaying by remaining ${diff}ms of ${this._intervalMs} interval`);
      await this.delayMs(diff);
    }
  }

  //

  public async delayMs(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
