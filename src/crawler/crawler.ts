import { parse } from "node-html-parser";
import { URL } from "url";
import { DomainHandler } from "../domain-handler/domain.handler.js";
import { TaskHandler } from "../task-handler/task.handler.js";

const A_TAG = "a";
const HREF_ATTR = "href";

export class Crawler {
  private domain: DomainHandler;
  private task: TaskHandler;

  constructor(seedUrl: string, taskLimit: number, intervalMs: number) {
    this.domain = new DomainHandler(seedUrl);
    this.task = new TaskHandler([seedUrl], taskLimit, intervalMs);
  }

  //

  public async start() {
    while (this.task.queue.count > 0 || this.task.count > 0) {
      if (this.task.queue.count > 0 && this.task.count < this.task.limit) {
        const nowMs = Date.now();

        await this.task.delayRemainingMs(nowMs);

        this.task.add((message) => this.crawl(message));
      } //
      else {
        // prevent cpu hogging
        await this.task.delayMs(5);
      }
    }
    return this.domain.map;
  }

  //

  private async crawl(inputUrl: string) {
    const response = await fetch(inputUrl);
    const text = await response.text();
    const html = parse(text);

    const urls = new Set<string>();
    const baseUrl = new URL(inputUrl);

    // TODO: move some of below into DomainHandler?

    html.getElementsByTagName(A_TAG).forEach((htmlElement) => {
      const href = htmlElement.getAttribute(HREF_ATTR);
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl);
          if (this.domain.target !== absoluteUrl.hostname) {
            throw new Error(absoluteUrl.hostname);
          }
          urls.add(absoluteUrl.toString());
        } catch (error: any) {
          console.warn(`skipped adding invalid url to queue: ${error?.message || error}`);
        }
      }
    });

    this.domain.map.set(inputUrl, urls);
    console.log(inputUrl, urls);

    for (const url of urls) {
      if (!this.domain.history.has(url)) {
        this.domain.history.add(url);
        this.task.queue.push(url);
      }
    }
  }
}
