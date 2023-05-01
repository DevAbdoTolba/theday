// simple puputer app

import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://www.google.com");
  const html = await page.content();
  await browser.close();
  res.status(200).send(html);
}
