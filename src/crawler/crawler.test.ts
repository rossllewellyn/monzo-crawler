import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Crawler } from "./crawler.js";
import { DomainHandler } from "../domain-handler/domain.handler.js";
import { TaskHandler } from "../task-handler/task.handler.js";

// mock fetch
global.fetch = vi.fn();

describe("Crawler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialise with seedUrl + taskLimit + intervalMs", () => {
    const seedUrl = "https://example.com";
    const taskLimit = 5;
    const intervalMs = 1000;

    const crawler = new Crawler(seedUrl, taskLimit, intervalMs);

    expect(crawler["domain"]).toBeInstanceOf(DomainHandler);
    expect(crawler["task"]).toBeInstanceOf(TaskHandler);
  });

  it("should crawl a page and extract links", async () => {
    const seedUrl = "https://example.com";
    const taskLimit = 5;
    const intervalMs = 1000;

    const mockHtml = `
    <html>
      <body>
        <a href="https://example.com/page1">Page 1</a>
        <a href="/page2">Page 2</a>
        <a href="https://other-domain.com/page3">External Page</a>
        <a>No href</a>
      </body>
    </html>
  `;

    vi.mocked(global.fetch).mockResolvedValue({
      text: vi.fn().mockResolvedValue(mockHtml),
    } as unknown as Response);
    vi.spyOn(console, "log").mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const crawler = new Crawler(seedUrl, taskLimit, intervalMs);
    await crawler["crawl"](seedUrl);

    expect(global.fetch).toHaveBeenCalledWith(seedUrl);
    expect(crawler["domain"].map.get(seedUrl)).toBeInstanceOf(Set);

    const extractedUrls = crawler["domain"].map.get(seedUrl);

    expect(extractedUrls?.has("https://example.com/page1")).toBe(true);
    expect(extractedUrls?.has("https://example.com/page2")).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("skipped adding invalid url to queue: other-domain.com")
    );
    expect(crawler["task"].queue.count).toBeGreaterThan(0);
  });

  it("should start crawling and process queue until empty", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const seedUrl = "https://example.com";
    const taskLimit = 5;
    const intervalMs = 0; // use 0 to avoid delays in tests

    const crawler = new Crawler(seedUrl, taskLimit, intervalMs);

    vi.spyOn(crawler["task"], "delayRemainingMs").mockResolvedValue(undefined);
    vi.spyOn(crawler["task"], "delayMs").mockResolvedValue(undefined);

    const mockHtml1 = `
      <html>
        <body>
          <a href="https://example.com/page1">Page 1</a>
        </body>
      </html>
    `;
    const mockHtml2 = `
      <html>
        <body>
          <a href="https://example.com/page2">Page 2</a>
        </body>
      </html>
    `;

    // mock responses for different URLs
    vi.mocked(global.fetch).mockImplementation((url) => {
      if (url === "https://example.com") {
        return Promise.resolve({
          text: () => Promise.resolve(mockHtml1),
        } as unknown as Response);
      } //
      else if (url === "https://example.com/page1") {
        return Promise.resolve({
          text: () => Promise.resolve(mockHtml2),
        } as unknown as Response);
      } //
      else {
        return Promise.resolve({
          text: () => Promise.resolve("<html><body></body></html>"),
        } as unknown as Response);
      }
    });

    const result = await crawler.start();

    expect(global.fetch).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Map);
    expect(result.has(seedUrl)).toBe(true);
  });
});
