'use strict';

const puppeteer = require('puppeteer');
const { clear, waitForVisible, waitForElements, captureScreen } = require('./utils/helpers.js');
const { cli } = require('./utils/cli.js');

const WRONG_LIST_OF_CITIES = 'listOfCities should always be an array';
const ALL_TASKS_FINISHED = '\nAll tasks finished!';

const widthOfScreenshot = 608;
const heightOfScreenshot = 624;

async function parseWeather (city, url, extensionOfOutput) {
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
    await page.type(accuPage.inputSearch, city);
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

    await captureScreen(page, extensionOfOutput, widthOfScreenshot, heightOfScreenshot);

    await browser.close();

    return city;
}

async function launchParserInParallel () {
    let { listOfCities, URL, extensionOfOutput } = await cli(process.argv);

    // console.log(`\nArguments in launchParser:\n` +
    //     `listOfCities: ${listOfCities}\nURL: ${URL}\nextensionOfOutput: ${extensionOfOutput}`);

    if (!Array.isArray(listOfCities)) {
        throw new Error(WRONG_LIST_OF_CITIES);
    }

    let promises = listOfCities.map(async (value, index) => {
        await parseWeather(value, URL, extensionOfOutput);
    });

    await Promise.all(promises);

    console.log(ALL_TASKS_FINISHED);
}

launchParserInParallel();
