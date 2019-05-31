'use strict';

const { cli } = require('./utils/cli.js');
const accuPage = require('./page_objects/accuweather.page.js');

const WRONG_LIST_OF_CITIES = 'listOfCities should always be an array';
const ALL_TASKS_FINISHED = '\nAll tasks finished!';

/**
 * Launches parsing with tasks executing in parallel.
 */
async function launchParserInParallel () {
    let { listOfCities, URL, extensionOfOutput } = await cli(process.argv);

    // console.log(`\nArguments in launchParser:\n` +
    //     `listOfCities: ${listOfCities}\nURL: ${URL}\nextensionOfOutput: ${extensionOfOutput}`);

    if (!Array.isArray(listOfCities)) {
        throw new Error(WRONG_LIST_OF_CITIES);
    }

    let promises = listOfCities.map(async (value, index) => {
        await accuPage.parseWeather(value, URL, extensionOfOutput);
    });

    await Promise.all(promises);

    console.log(ALL_TASKS_FINISHED);
}

/**
 * Launches parsing with tasks executing in order.
 */
async function launchParserInOrder () {
    let { listOfCities, URL, extensionOfOutput } = await cli(process.argv);

    // console.log(`\nArguments in launchParser:\n` +
    //     `listOfCities: ${listOfCities}\nURL: ${URL}\nextensionOfOutput: ${extensionOfOutput}`);

    if (!Array.isArray(listOfCities)) {
        throw new Error(WRONG_LIST_OF_CITIES);
    }

    for (const [index, value] of listOfCities.entries()) {
        const todo = await accuPage.parseWeather(listOfCities[index], URL, extensionOfOutput);

        console.log(`Task ${index + 1}: ${todo} - done!\n====`);
    }

    console.log(ALL_TASKS_FINISHED);
}

launchParserInParallel();
// launchParserInOrder();
