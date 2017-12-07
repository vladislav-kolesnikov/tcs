const dummyJson = require('dummy-json');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
// const writeFile = promisify(fs.writeFile);
const $sortBy = require('lodash/sortBy');
const $map = require('lodash/map');

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

let prevValue = 0;

/**
 *
 * @param {Object} result
 * @returns {Object} statsData
 */
function prepareStatsData(result) {
	const statsData = {};
	
	Object.values(result).forEach((stats, idx) => {
		const preparedStats = $map(stats, ({ currency, dayIdx }) => {
			const stats = {
				growIndex: calculateCoefficient(prevValue, currency),
				timestamp: new Date(2016, idx, dayIdx).getTime(),
				currency
			};
			prevValue = currency;
			return stats;
		});
		statsData[idx] = $sortBy(preparedStats, ['stat', 'timestamp'])
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
	await sleep(2);
	return prepareStatsData(parsedResult);
}

module.exports = saveStats;