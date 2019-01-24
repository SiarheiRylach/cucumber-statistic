'user strict';

const fs = require('fs');
const {getStatistic, statisticSort} = require('./lib');

const args = require('yargs').options({
    statisticType: {
        alias: 'statisticType',
        default: 'scenarios',
        type: 'string',
        choices: ['steps', 'scenarios']
    },
    outputDestination: {
        alias: 'outputDest',
        default: './',
        type: 'string',
    },
    cucumberResultsPath: {
        alias: 'cucumberPath',
        default: './cucumber.json',
        type: 'string',
    },
    sortType: {
        alias: 'sort',
        default: 'asc',
        type: 'string',
        choices: ['asc', 'desc']
    },
}).argv;

const statistic = getStatistic(require(args.cucumberResultsPath), args.statisticType)
    .sort(statisticSort(true, args.statisticType));

fs.writeFileSync(`${args.outputDestination}${args.statisticType}.duration.json`, JSON.stringify(statistic, null, 4));
