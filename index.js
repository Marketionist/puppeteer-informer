'use strict';

const puppeteer = require('puppeteer');
const { clear, waitForVisible, waitForElements, makeScreenshot, makePDF } = require('./utils/helpers.js');

const inputArguments = process.argv.slice(2);

let listCities;

// Check if --yes flag is provided to use default array of cities
if (inputArguments.includes('--yes')) {
    listCities = ['Málaga', 'Heraklion', 'Budva', 'Paphos', 'Amsterdam'];

    // Check if process.env.CITY parameter with array of cities is set
    if (process.env.CITY) {
        listCities = process.env.CITY.split(',').map((value) => {
            return value.trim();
        });
    }
};

// Check at what index the URL is provided
let indexInputURL = inputArguments.map((value) => { return value.match(/^http/gi); })
    .findIndex((value) => { return value == "http"; } );

const extensionOutput = inputArguments[indexInputURL + 1];

console.log(`\n====\ninputArguments: ${inputArguments}\nlistCities: ${listCities}\n` +
    `extensionOutput: ${extensionOutput}\n====\n`);

async function parseWeather (url) {

    const accuPage = require('./page_objects/accuweather.page.js');

    // Browser Display Statistics: https://www.w3schools.com/browsers/browsers_display.asp
    // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.17.0/docs/api.md#puppeteerlaunchoptions):
    // headless: false - run full (non-headless) Chrome or Chromium
    // slowMo: 250 - slows down the exectution of each command in browser for 250ms
    const options = {
        headless: !process.env.HEADLESS,
        defaultViewport: { width: 1366, height: 768 }
    }

    const browser = await puppeteer.launch({
        ...options,
        args: ['--disable-infobars'],
        ignoreDefaultArgs: ['--enable-automation']
    });
    const page = await browser.newPage();

    // Only allow requests with the resource types provided in listPermittedResouceTypes to get through,
    // block all 'image' requests and everything else besides the original HTML response
    let listPermittedResouceTypes = ['document', 'script', 'stylesheet'];
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (listPermittedResouceTypes.includes(request.resourceType())) {
            request.continue();
        } else {
            request.abort();
        }
    });

    // Go to the page and wait for it to load
    // Options:
    // waitUntil: 'networkidle0'
    // waitUntil: 'domcontentloaded'
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.click(accuPage.buttonCookieContinue);
    // Set temperature unit to Celsius
    await page.click(accuPage.blockSettings);
    // Wait until displayed and "visibility" not hidden
    await waitForVisible(page, accuPage.blockCelsius);
    await page.click(accuPage.blockCelsius);

    await page.reload(url);

    await page.click(accuPage.inputSearch);
    await clear(page, accuPage.inputSearch);
    await page.type(accuPage.inputSearch, listCities[0]);
    await page.click(accuPage.buttonGo);

    await page.reload(url);

    // Wait for any of two selectors, one for each possible path
    waitForElements(page, accuPage.blockCurrentCity, accuPage.blockFirstCity);

    let txtFirstCity = await page.evaluate(async (selectorCity) => {
        let linkFirstCity = await document.querySelector(selectorCity);
        let result = null;

        if (linkFirstCity) {
            result = linkFirstCity.innerText.trim();
        }

        return result;
    }, accuPage.blockFirstCity);

    if (txtFirstCity) {
        console.log(`\nSeveral cities match the search input - ${txtFirstCity} will be selected\n`);
        await page.click(accuPage.blockFirstCity);
    }

    await waitForVisible(page, accuPage.linkExtended);
    await page.click(accuPage.linkExtended);
    await waitForVisible(page, accuPage.blockCurrentCity);

    await accuPage.scrapeAccuPageData(page);

    if (extensionOutput === 'png') {
        await makeScreenshot(page);
    } else if (extensionOutput === 'pdf') {
        await makePDF(page);
    } else {
        console.info('\nSecond (optional) argument was not "png" or "pdf" or was not provided\n');
    }

    await browser.close();
}

if (indexInputURL !== -1) {
    const url = inputArguments[indexInputURL];

    console.log('url: ', url);

    parseWeather(url);
} else {
    throw new Error(`Please provide URL as a first argument and "png" or "pdf" as a second (optional) argument -
        for example: \"node index.js https://www.accuweather.com/en/europe-weather png\"`);
}
