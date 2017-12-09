import $flatten from 'lodash/flatten';
import getMonthName from 'utility/getMonthName';

/**
 *
 * @param data
 * @param canvasWidth
 * @param canvasHeight
 * @param canvasOffset
 * @returns {{coordinates: Array, pointsDict: {}, minValue: *, maxValue: *, xLegendData: Array, polyLinePoints: string}}
 */
export default function prepareChartData({ data, canvasWidth, canvasHeight, canvasOffset }) {
	const pointsDict = {};
	const stats = Object.values(data);
	const monthCountList = Object.keys(data);
	const daysInMonthsList = stats.map(statsList => statsList.length).reverse();
	const flatStatsData = $flatten(stats);
	const valuesCount = flatStatsData.length;
	const coordinates = new Array(valuesCount);
	const polyLinePoints = Array.from(coordinates);
	
	const maxValue = flatStatsData.reduce((acc, { currency }) => Math.max(acc, currency), 0);
	const minValue = flatStatsData.reduce((acc, { currency }) => Math.min(acc, currency), maxValue);
	
	let daysCount = daysInMonthsList.pop();
	const X_SECTOR_WIDTH = canvasWidth / monthCountList.length;
	let X_MONTH_PART_WIDTH = X_SECTOR_WIDTH / daysCount;
	let X_OFFSET = 0;
	let i = 0;
	let j = 1;
	
	while (i < valuesCount) { // 180
		const { currency, growIndex, timestamp } = flatStatsData[i];
		
		/**
		 *
		 * @type {number}
		 */
		const x = Math.floor(j * X_MONTH_PART_WIDTH + X_OFFSET);
		const y = canvasHeight - (currency * canvasHeight * .8 / maxValue) - canvasHeight * .1;
		
		pointsDict[x] = {
			currency,
			growIndex,
			timestamp,
			x,
			y
		};
		
		coordinates[i] = { x, y };
		polyLinePoints[i] = `${x}, ${y}`;
		
		
		if (j !== 1 && j % daysCount === 0 || j === 1 && daysCount === 1) {
			daysCount = daysInMonthsList.pop();
			X_MONTH_PART_WIDTH = X_SECTOR_WIDTH / daysCount;
			X_OFFSET += X_SECTOR_WIDTH;
			j = 1;
		} else {
			j++;
		}
		
		i++;
	}
	
	for (let k = 0; k < canvasWidth; k++) {
		if (!pointsDict[k]) {
			if (!pointsDict[k - 1]) {
				continue;
			}
			
			pointsDict[k] = pointsDict[k - 1];
		}
	}

	return {
		coordinates,
		pointsDict,
		minValue,
		maxValue,
		xLegendData: monthCountList.map(getMonthName),
		polyLinePoints: polyLinePoints.join(' ')
	}
}