'use strict';

let internalFunctions = {

    _createTimestamp: function () {
        return new Date().getTime();
    }

}

module.exports = {

    clear: async function (page, element) {
        // await page.evaluate(selector => {
        //     document.querySelector(selector).value = "";
        // }, selector);
        const inputValueLength = await page.evaluate((selector) => {
            return (document.querySelector(selector).value.length);
        }, element);
    
        for (let i = 0; i < inputValueLength; i++) {
            await page.keyboard.press('Backspace');
        }
    },
    waitForVisible: async function (page, element) {
        // Wait until element is displayed and "visibility" not hidden
        await page.waitForFunction((selector) => {
            return (document.querySelector(selector) &&
                document.querySelector(selector).clientHeight !== 0 &&
                document.querySelector(selector).style.visibility !== 'hidden')
        }, {}, element);
    },
    waitForElements: async function (page, ...elements) {
        // Wait for at least one of provided elements to appear on a page during 10 sec
        await page.waitForFunction((selector) => {
            return !!document.querySelectorAll(selector).length;
        }, { timeout: 10000 }, elements.join(', '));
    },
    makeScreenshot: async function (page) {
        // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.17.0/docs/api.md#pagescreenshotoptions):
        // fullPage: true
        await page.screenshot({
            path: `screenshot-${internalFunctions._createTimestamp()}.png`,
            clip: { x: 0, y: 0, width: 608, height: 624 }
        });
    },
    makePDF: async function (page) {
        // Options (https://github.com/GoogleChrome/puppeteer/blob/v1.17.0/docs/api.md#pagepdfoptions)
        await page.pdf({
            path: `screenshot_print-${internalFunctions._createTimestamp()}.pdf`,
            printBackground: true,
            format: 'A4'
        });
    }

};
