'use strict';

module.exports = (function () {

    let accuweatherPage = {

        buttonCookieContinue: '#eu-cookie-notify-wrap .continue',
        blockSettings: '#bt-menu-settings',
        blockCelsius: '[for=\"settings-temp-unit-celsius\"]',
        inputSearch: '#s',
        buttonGo: '.bt-go',
        blockCurrentCity: '.current-city > h1',
        blockFirstCity: '.results-list .articles > li:first-child',
        linkExtended: '[data-label=\"fcst_nav_forecast_extended\"]',

    };

    accuweatherPage.scrapeAccuPageData = async function (page) {
        // Run javascript inside the page
        let data = await page.evaluate((pageObject) => {
            const blockTempToday = '.fday1';
            const blockTempTomorrow = '.fday2';
    
            let txtCitySelected = document.querySelector(pageObject.blockCurrentCity).innerText;
    
            let txtDateToday = document.querySelector(`${blockTempToday} h4`).innerText;
            let txtTemperatureToday = document.querySelector(`${blockTempToday} .temp`).innerText
                .replace(/[\n]+/gi, '');
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
        }, accuweatherPage);
    
        // Outputting what was scraped
        // console.log(JSON.stringify(data, null, 4));
        console.log(`${data.txtCitySelected} \nToday (${data.txtDateToday}): ${data.txtTemperatureToday}, ` +
            `${data.txtConditionsToday}\nTomorrow (${data.txtDateTomorrow}): ${data.txtTemperatureTomorrow}, ` +
            `${data.txtConditionsTomorrow}\n====`);
    
        return data;
    };

    return accuweatherPage;

})();
