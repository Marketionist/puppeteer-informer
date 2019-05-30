'use strict';

const puppeteer = require('puppeteer');
const { clear, waitForVisible, waitForElements, captureScreen } = require('../utils/helpers.js');

const SEVERAL_CITIES_MATCH_INPUT = '\nSeveral cities match the search input - %s will be selected\n';

module.exports = (function () {

    let accuweatherPage = {

        buttonCookieContinue: '#eu-cookie-notify-wrap .continue',
        blockSettings: '#bt-menu-settings',
        blockCelsius: '[for=\"settings-temp-unit-celsius\"]',
        inputSearch: '#s',
        buttonGo: '.bt-go',
        blockCurrentCity: '.current-city > h1',
        blockFirstCity: '.results-list .articles > li:first-child',
        linkExtended: '[data-label=\"fcst_nav_forecast_extended\"]'

    };

    accuweatherPage.scrapeAccuPageData = async function (page) {
        // Run javascript inside the page
        let data = await page.evaluate((pageObject) => {
            const blockTempToday = '.fday1';
            const blockTempTomorrow = '.fday2';

            let txtCitySelected = document.querySelector(pageObject.blockCurrentCity).innerText;

            // Today block
            let txtDateToday = document.querySelector(`${blockTempToday} h4`).innerText;
            let txtTemperatureToday = document.querySelector(`${blockTempToday} .temp`).innerText
                .replace(/[\n]+/gi, '');
            let txtConditionsToday = document.querySelector(`${blockTempToday} .cond`).innerText;

            // Tomorrow block
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
        }, accuweatherPage);

        // Outputting what was scraped
        // console.log(JSON.stringify(data, null, 4));
        console.log(`${data.txtCitySelected} \nToday (${data.txtDateToday}): ${data.txtTemperatureToday}, ` +
            `${data.txtConditionsToday}\nTomorrow (${data.txtDateTomorrow}): ${data.txtTemperatureTomorrow}, ` +
            `${data.txtConditionsTomorrow}\n====`);

        return data;
    };

    accuweatherPage.parseWeather = async function (city, url, extensionOfOutput) {
        const widthOfScreenshot = 608;
        const heightOfScreenshot = 624;

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
        await page.click(accuweatherPage.buttonCookieContinue);
        // Set temperature unit to Celsius
        await page.click(accuweatherPage.blockSettings);
        // Wait until displayed and "visibility" not hidden
        await waitForVisible(page, accuweatherPage.blockCelsius);
        await page.click(accuweatherPage.blockCelsius);

        await page.reload(url);

        await page.click(accuweatherPage.inputSearch);
        await clear(page, accuweatherPage.inputSearch);
        await page.type(accuweatherPage.inputSearch, city);
        await page.click(accuweatherPage.buttonGo);

        await page.reload(url);

        // Wait for any of two selectors, one for each possible path
        waitForElements(page, accuweatherPage.blockCurrentCity, accuweatherPage.blockFirstCity);

        let txtFirstCity = await page.evaluate(async (selectorCity) => {
            let linkFirstCity = await document.querySelector(selectorCity);
            let result = null;

            if (linkFirstCity) {
                result = linkFirstCity.innerText.trim();
            }

            return result;
        }, accuweatherPage.blockFirstCity);

        if (txtFirstCity) {
            console.log(SEVERAL_CITIES_MATCH_INPUT, txtFirstCity);
            await page.click(accuweatherPage.blockFirstCity);
        }

        await waitForVisible(page, accuweatherPage.linkExtended);
        await page.click(accuweatherPage.linkExtended);
        await waitForVisible(page, accuweatherPage.blockCurrentCity);
    
        await accuweatherPage.scrapeAccuPageData(page);

        await captureScreen(page, extensionOfOutput, widthOfScreenshot, heightOfScreenshot);

        await browser.close();

        return city;
    }

    return accuweatherPage;

})();
