const puppeteer = require('puppeteer');

const url = process.argv[2];

const output = process.argv[3];

if (!url) {
    throw `Please provide URL as a first argument and "png" or "pdf" as a second (optional) argument - for example
        \"CITY='Amsterdam' node index.js https://www.accuweather.com/en/europe-weather png\"`;
}

async function clear (page, element) {
    // await page.evaluate(selector => {
    //     document.querySelector(selector).value = "";
    // }, selector);
    const inputValueLength = await page.evaluate((selector) => {
        return (document.querySelector(selector).value.length);
    }, element);

    for (let i = 0; i < inputValueLength; i++) {
        await page.keyboard.press('Backspace');
    }
}

async function waitForVisible (page, element) {
    // Wait until element is displayed and "visibility" not hidden
    await page.waitForFunction((selector) => {
        return (document.querySelector(selector) &&
            document.querySelector(selector).clientHeight !== 0 &&
            document.querySelector(selector).style.visibility !== 'hidden')
    }, {}, element);
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
    let timestamp = new Date().getTime();

    // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.14.0/docs/api.md#pagescreenshotoptions):
    // fullPage: true
    await page.screenshot({ path: `screenshot-${timestamp}.png`, clip: { x: 0, y: 0, width: 608, height: 624 } });
}

async function makePDF (page) {
    let timestamp = new Date().getTime();

    // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.14.0/docs/api.md#pagepdfoptions)
    await page.pdf({ path: `screenshotprint-${timestamp}.pdf`, printBackground: true, format: 'A4' });
}

async function parseWeather (url) {
    // Browser Display Statistics: https://www.w3schools.com/browsers/browsers_display.asp
    // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.17.0/docs/api.md#puppeteerlaunchoptions):
    // headless: false - run full (non-headless) Chrome or Chromium
    // slowMo: 250 - slows down the exectution of each command in browser for 250ms
    const options = {
        headless: false,
        defaultViewport: { width: 1366, height: 768 }
    }

    const browser = await puppeteer.launch({
        ...options,
        args: ['--disable-infobars'],
        ignoreDefaultArgs: ['--enable-automation']
    });
    const page = await browser.newPage();
    const buttonCookieContinue = '#eu-cookie-notify-wrap .continue';
    const blockSettings = '#bt-menu-settings';
    const blockCelsius = '[for=\"settings-temp-unit-celsius\"]';
    const inputSearch = '#s';
    const buttonGo = '.bt-go';
    const blockCurrentCity = '.current-city > h1';
    const blockFirstCity = '.results-list .articles > li:first-child';
    const linkExtended = '[data-label=\"fcst_nav_forecast_extended\"]';

    // Go to the page and wait for it to load
    // Options:
    // waitUntil: 'networkidle0'
    // waitUntil: 'domcontentloaded'
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.click(buttonCookieContinue);
    // Set temperature unit to Celsius
    await page.click(blockSettings);
    // Wait until displayed and "visibility" not hidden
    await waitForVisible(page, blockCelsius);
    await page.click(blockCelsius);

    await page.reload(url);

    await page.click(inputSearch);
    await clear(page, inputSearch);
    await page.type(inputSearch, process.env.CITY);
    await page.click(buttonGo);

    await page.reload(url);

    // Wait for any of two selectors, one for each possible path:
    await page.waitForFunction((selector) => {
        return document.querySelectorAll(selector).length;
    }, { timeout: 10000 }, `${blockCurrentCity}, ${blockFirstCity}`);

    let txtFirstCity = await page.evaluate(async (selectorCity) => {
        let linkFirstCity = await document.querySelector(selectorCity);
        let result = null;

        if (linkFirstCity) {
            result = linkFirstCity.innerText.trim();
        }

        return result;
    }, blockFirstCity);

    if (txtFirstCity) {
        console.log(`Several cities match the search input - ${txtFirstCity} will be selected`);
        await page.click(blockFirstCity);
    }

    await waitForVisible(page, linkExtended);
    await page.click(linkExtended);
    await waitForVisible(page, blockCurrentCity);

    await scrapePageData(page);

    if (output === 'png') {
        await makeScreenshot(page);
    } else if (output === 'pdf') {
        await makePDF(page);
    }

    await browser.close();
}

parseWeather(url);
