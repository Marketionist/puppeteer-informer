const puppeteer = require('puppeteer');

const url = process.argv[2];

if (!url) {
    throw "Please provide URL as a first argument - for example \"node index.js https://www.google.com/\"";
}

async function makeScreenshot () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    await page.screenshot({path: 'screenshot.png'});
    browser.close();
}

makeScreenshot();
