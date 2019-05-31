'use strict';

const prompts = require('prompts');

const WRONG_ARGUMENTS = `Please provide:
        - URL as a first argument
        - "png" or "pdf" as a second (optional) argument
        For example: \"node index.js https://www.accuweather.com/en/europe-weather png\"`;
const RECEIVED_TASKS = '\nReceived %d task(s): [%s]. Please wait while executing...\n';

/**
 * Parses raw arguments provided when launching index.js.
 * @param {Array.<string>} rawArgs Raw arguments provided while launching index.js.
 * @returns {Object} Options parsed from raw arguments.
 */
function parseArgumentsIntoOptions (rawArgs) {
    const listOfInputArguments = rawArgs.slice(2);

    let skipPrompts = false;
    let listOfCities = ['Málaga', 'Heraklion', 'Budva', 'Paphos', 'Amsterdam'];

    // Check if --yes flag is provided to use default array of cities
    if (listOfInputArguments.includes('--yes')) {
        skipPrompts = true;
    }

    // Check if process.env.CITY parameter is set, transform it to array
    if (process.env.CITY) {
        listOfCities = process.env.CITY.split(',').map((value) => { return value.trim(); });
    }

    // Check at what index the URL is provided
    let indexInputURL = listOfInputArguments.map((value) => { return value.match(/^http/gi); }).findIndex((value) => {
        if (!value) {
            return false;
        }

        return value.join('') === 'http';
    });

    try {
        if (indexInputURL === -1) {
            throw new Error(WRONG_ARGUMENTS);
        }
    } catch (err) {
        if (err.message === WRONG_ARGUMENTS) {
            console.log(WRONG_ARGUMENTS);
            process.exit(1);
        } else {
            throw err;
        }
    }

    const URL = listOfInputArguments[indexInputURL];
    const extensionOfOutput = listOfInputArguments[indexInputURL + 1];

    // console.log(`\n====\nRaw arguments in parseArgumentsIntoOptions: skipPrompts: ${skipPrompts}\n` +
    //     `listOfInputArguments: ${listOfInputArguments}\nlistOfCities: ${listOfCities}\n` +
    //     `URL: ${URL}\nextensionOfOutput: ${extensionOfOutput}\n====\n`);

    return {
        skipPrompts,
        listOfInputArguments,
        listOfCities,
        URL,
        extensionOfOutput
    };
}

/**
 * Prompts user for missing options.
 * @param {Object} options Current options provided while launching index.js.
 * @returns {Object} Options extended from user's input.
 */
async function promptForMissingOptions (options) {
    if (options.skipPrompts) {
        // console.log('Using default options in promptForMissingOptions:', options);
        return options;
    }

    let questions = [
        // {
        //     type: 'number',
        //     name: 'value',
        //     message: 'How old are you?',
        //     validate: (value) => { return value < 18 ? `This tool is 18+ only` : true; }
        // },
        // {
        //     type: 'toggle',
        //     name: 'value',
        //     message: 'Do you like JavaScript?',
        //     initial: true,
        //     active: 'yes',
        //     inactive: 'no'
        // },
        // {
        //     type: (previousAnswer) => { return previousAnswer === true ? 'text' : null; },
        //     name: 'framework',
        //     message: 'Name your favourite framework'
        // },
        {
            type: 'select',
            name: 'value',
            message: 'Select a city',
            choices: [
                { title: 'Málaga', value: ['Málaga'] },
                { title: 'Heraklion', value: ['Heraklion'] },
                { title: 'Budva', value: ['Budva'] },
                { title: 'Paphos', value: ['Paphos'] },
                { title: 'Amsterdam', value: ['Amsterdam'] },
                { title: 'All', value: ['Málaga', 'Heraklion', 'Budva', 'Paphos', 'Amsterdam'] }
            ],
            initial: 4
        }
    ];

    const answers = await prompts(questions);

    options.listOfCities = answers.value;

    // console.log('\nOptions in promptForMissingOptions:', options);

    return options;
}

module.exports = {

    cli: async function (args) {
        let options = parseArgumentsIntoOptions(args);

        options = await promptForMissingOptions(options);

        console.log(RECEIVED_TASKS, options.listOfCities.length, options.listOfCities);
        // console.log('\nOptions in cli:', options);

        return options;
    }

};
