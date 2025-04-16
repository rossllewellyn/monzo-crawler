import { describe, it, expect } from "vitest";
import { DomainHandler } from "./domain.handler.js";

describe("DomainHandler", () => {
  it("should initialise with seedUrl", () => {
    const seedUrl = "https://example.com/path";
    const handler = new DomainHandler(seedUrl);

    expect(handler.target).toBe("example.com");
    expect(handler.history).toBeInstanceOf(Set);
    expect(handler.history.has(seedUrl)).toBe(true);
    expect(handler.history.size).toBe(1);
    expect(handler.map).toBeInstanceOf(Map);
    expect(handler.map.size).toBe(0);
  });

  it("should throw for empty string input", () => {
    expect(() => new DomainHandler("")).toThrow();
  });

  it("should throw for invalid url input", () => {
    expect(() => new DomainHandler("not-a-url")).toThrow();
  });

  it("should extract hostname from seedUrl input", () => {
    const handler = new DomainHandler("https://test.example.co.uk/some/path?query=value");
    expect(handler.target).toBe("test.example.co.uk");
  });
});
