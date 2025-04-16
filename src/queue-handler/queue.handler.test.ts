import { describe, it, expect } from "vitest";
import { QueueHandler } from "./queue.handler.js";

describe("QueueHandler", () => {
  it("should initialise with empty queue for no initialState input", () => {
    const handler = new QueueHandler();

    expect(handler.count).toBe(0);
    expect(handler.copy).toEqual([]);
  });

  it("should initialise with deep copy queue as initialState input", () => {
    const initialState = ["message1", "message2"];
    const handler = new QueueHandler(initialState);

    expect(handler.count).toBe(2);
    expect(handler.copy).toEqual(initialState);

    initialState.push("message3");

    expect(handler.count).toBe(2);
  });

  it("should add messages to queue with .push()", () => {
    const handler = new QueueHandler();
    handler.push("message1");

    expect(handler.count).toBe(1);
    expect(handler.copy).toEqual(["message1"]);

    handler.push("message2");

    expect(handler.count).toBe(2);
    expect(handler.copy).toEqual(["message1", "message2"]);
  });

  it("should remove and return first message on queue with .shift()", () => {
    const handler = new QueueHandler(["message1", "message2"]);
    const firstMessage = handler.shift();

    expect(firstMessage).toBe("message1");
    expect(handler.count).toBe(1);
    expect(handler.copy).toEqual(["message2"]);

    const secondMessage = handler.shift();

    expect(secondMessage).toBe("message2");
    expect(handler.count).toBe(0);
    expect(handler.copy).toEqual([]);
  });

  it("should return undefined when shifting from empty queue", () => {
    const handler = new QueueHandler();
    const result = handler.shift();

    expect(result).toBeUndefined();
  });
});
