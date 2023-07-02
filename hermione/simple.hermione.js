const assert = require("assert");
describe("Конвертер валют", () => {
 it("должен появиться на странице", async ({ browser }) => {
 const puppeteer = await browser.getPuppeteer();
 const [page] = await puppeteer.pages();

 await page.goto('https://ya.ru');
 await page.keyboard.type('Курс доллара к рублю');
 await page.keyboard.press('Enter');
 await browser.pause(1000);
 const selector = await page.$('.Converter');
 assert.ok(selector, 'Конвертер валют не появился');
 });
});