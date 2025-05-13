import { Browser, Page } from "puppeteer";

export default async function closers(browser: Browser) {
  const pages = await browser.pages();
  await Promise.all(pages.map((page: Page) => page.close()));
  await browser.close();
}
