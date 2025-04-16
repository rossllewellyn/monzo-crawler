import { Crawler } from "./crawler/crawler.js";

export const main = async (seedUrl: string, taskLimit: number, intervalMs: number) => {
  const crawler = new Crawler(seedUrl, taskLimit, intervalMs);

  console.log(`starting crawler for ${seedUrl} ...`);
  const startTime = Date.now();

  const siteMap = await crawler.start();

  const endTime = Date.now();
  const elapsedSecs = (endTime - startTime) / 1000;
  console.log(`crawled ${siteMap.size} urls in ${elapsedSecs} seconds`);

  return siteMap;
};

(async () => {
  const args = process.argv.slice(2);

  const defaultSeedUrl = "https://books.toscrape.com";
  const defaultTaskLimit = 50;
  const defaultIntervalMs = 0;

  const seedUrl = args[0] || defaultSeedUrl;
  const taskLimit = args[1] ? parseInt(args[1], 10) : defaultTaskLimit;
  const intervalMs = args[2] ? parseInt(args[2], 10) : defaultIntervalMs;

  await main(seedUrl, taskLimit, intervalMs);
})();
