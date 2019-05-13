const puppeteer = require('puppeteer');

const url = process.argv[2];

const output = process.argv[3];

if (!url) {
    throw `Please provide URL as a first argument and "png" or "pdf" as a second (optional) argument - for example
        \"node index.js https://www.accuweather.com/en/nl/amsterdam/249758/daily-weather-forecast/249758 png\"`;
}

async function scrapePageData (page) {
    // Run javascript inside the page
    let data = await page.evaluate(() => {
        const blockTempToday = '.fday1';
        const blockTempTomorrow = '.fday2';

        let txtCitySelected = document.querySelector('.current-city > h1').innerText;

        let txtDateToday = document.querySelector(`${blockTempToday} h4`).innerText;
        let txtTemperatureToday = document.querySelector(`${blockTempToday} .temp`).innerText.replace(/[\n]+/gi, '');
        let txtConditionsToday = document.querySelector(`${blockTempToday} .cond`).innerText;

        let txtDateTomorrow = document.querySelector(`${blockTempTomorrow} h4`).innerText;
        let txtTemperatureTomorrow = document.querySelector(`${blockTempTomorrow} .temp`)
            .innerText.replace(/[\n]+/gi, '');
        let txtConditionsTomorrow = document.querySelector(`${blockTempTomorrow} .cond`).innerText;

        // Returning an object filled with the scraped data
        return {
            txtCitySelected,
            txtDateToday,
            txtTemperatureToday,
            txtConditionsToday,
            txtDateTomorrow,
            txtTemperatureTomorrow,
            txtConditionsTomorrow
        }
    });

    // Outputting what was scraped
    // console.log(JSON.stringify(data, null, 4));
    console.log(`${data.txtCitySelected} \nToday (${data.txtDateToday}): ${data.txtTemperatureToday}, ` +
        `${data.txtConditionsToday}\nTomorrow (${data.txtDateTomorrow}): ${data.txtTemperatureTomorrow}, ` +
        `${data.txtConditionsTomorrow}`);

    return data;
}

async function makeScreenshot (page) {
    // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.14.0/docs/api.md#pagescreenshotoptions):
    // fullPage: true
    await page.screenshot({ path: 'screenshot.png', clip: { x: 0, y: 0, width: 608, height: 624 } });
}

async function makePDF (page) {
    // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.14.0/docs/api.md#pagepdfoptions)
    await page.pdf({ path: 'page-print.pdf', printBackground: true, format: 'A4' });
}

async function navigateToPage () {
    // Browser Display Statistics: https://www.w3schools.com/browsers/browsers_display.asp
    // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.14.0/docs/api.md#puppeteerlaunchoptions):
    // headless: false - run full (non-headless) Chrome or Chromium
    // slowMo: 250 - slows down the exectution of each command in browser for 250ms
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1366, height: 768 } });
    const page = await browser.newPage();
    const buttonCookieContinue = '#eu-cookie-notify-wrap .continue';
    const blockSettings = '#bt-menu-settings';
    const blockCelsius = '[for="settings-temp-unit-celsius"]';

    // Go to the page and wait for it to load
    // Options:
    // waitUntil: 'networkidle0'
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.click(buttonCookieContinue);
    // Set temperature unit to Celsius
    await page.click(blockSettings);
    await page.click(blockCelsius);

    // await page.type('#s', process.env.CITY);
    // await page.click('.city-suggestion');
    // await page.click('.bt-go');

    await scrapePageData(page);

    if (output === 'png') {
        await makeScreenshot(page);
    } else if (output === 'pdf') {
        await makePDF(page);
    }

    await browser.close();
}

navigateToPage();
