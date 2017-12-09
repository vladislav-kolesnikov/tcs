const dummyJson = require('dummy-json');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
// const writeFile = promisify(fs.writeFile);
const _ = require('lodash');

function calculateCoefficient(prevValue, currentValue) {
	if (!prevValue) {
		return {
			coefficient: null,
			growing: false
		};
	}
	
	const isGoodStats = currentValue > prevValue;
	let difference = 100 - ((currentValue * 100) / prevValue);
	
	return {
		coefficient: isGoodStats ? Math.abs(difference) : -difference,
		growing: isGoodStats,
		prevValue,
		currentValue
	};
}


/**
 *
 * @param {Object} result
 * @returns {Object} statsData
 */
function prepareStatsData(result) {
	let prevValue = 0;
	const statsData = {};
	
	Object.values(result).forEach((stats, idx) => {
		statsData[idx] = _
			.chain(stats)
			.map(({ currency, dayIdx }) => ({
				timestamp: new Date(2016, idx, dayIdx).getTime(),
				currency
			}))
			.sortBy('timestamp')
			.map(({ currency, ...restStats }) => {
				const stat = {
					...restStats,
					growIndex: calculateCoefficient(prevValue, currency),
					currency
				};
				
				prevValue = currency;
				return stat;
			});
	});
	
	return statsData;
}

function sleep(ms) {
	return new Promise((res, rej) => {
		setTimeout(() => {
			return res();
		}, ms * 1000);
	})
}


async function saveStats() {
	const template = await readFile(path.join(__dirname, 'stats.template.hbs'), {
		encoding: 'utf8'
	});
	const result = dummyJson.parse(template);
	const parsedResult = JSON.parse(result);
	// await sleep(2);
	return prepareStatsData(parsedResult);
}

module.exports = saveStats;