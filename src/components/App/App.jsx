import React, { PureComponent } from 'react';
import Chart from 'components/Chart';
import CSSModules from 'react-css-modules';
import styles from './App.scss';
import $flatten from 'lodash/flatten';

const OFFSET = 40;
const WIDTH = 960;
const HEIGHT = WIDTH / 2;
const STATS_POPUP_SIZE = 100;

function calculatePositionByValue(value, maxValue, canvasSize) {
	if (maxValue === 0) {
		throw new Error('DIVISION ZERO ERROR');
	}
	
	if (!value || !maxValue || !canvasSize) {
		throw new Error('Required attributes "value", "maxValue", "canvasSize" must be provided')
	}
	
	return (value * canvasSize) / maxValue;
}

@CSSModules(styles, {
	allowMultiple: true,
	handleNotFoundStyleName: 'ignore'
})
class App extends PureComponent {
	constructor(props, ctx) {
		super(props, ctx);
		
		this.state = {
			loading: false,
			initial: true,
			success: false,
			statsData: {},
			maxValue: null
		};
	}
	
	static prepareData(data, maxValue) {
		const pointsDict = {};
		const originalDataValues = Object.values(data);
		const counts = originalDataValues.map(arr => arr.length).reverse();
		
		const flattedData = $flatten(originalDataValues);
		const preparedCoordinates = new Array(flattedData.length);
		let elementsCount = counts.pop();
		let i = 1;
		
		// ширина сектора 1 месяца по оси X
		const monthSectorWidth = WIDTH / originalDataValues.length;
		let monthSectorPartWidth = monthSectorWidth / elementsCount;
		
		let X_OFFSET = 0;
		
		flattedData.forEach(({ currency, growIndex, timestamp }, idx) => {
			const x = i * monthSectorPartWidth + X_OFFSET;
			
			const y = calculatePositionByValue(
				currency,
				maxValue,
				HEIGHT - OFFSET
			);
			
			pointsDict[x] = {
				y,
				x,
				growIndex,
				timestamp,
				currency
			};
			
			preparedCoordinates[idx] = {
				x,
				y,
				monthSectorWidth
			};
			
			if (i !== 1 && i % elementsCount === 0 || i === 1 && elementsCount === 1) {
				elementsCount = counts.pop();
				monthSectorPartWidth = monthSectorWidth / elementsCount;
				X_OFFSET += monthSectorWidth;
				i = 1;
			} else {
				i++;
			}
		});
		return {
			pointsDict,
			preparedCoordinates
		}
	}
	
	componentDidMount() {
		this.fetchChartData();
	}
	
	fetchChartData = () => {
		this.setState(_ => ({
			initial: false,
			loading: true,
			success: false
		}), () => {
			fetch('/api/charts')
				.then(res => res.json())
				.then(statsDataDict => {
					const maxValue = Object
						.values(statsDataDict)
						.map(stats => stats.reduce((acc, { currency }) => Math.max(acc, currency), 0))
						.reduce((acc, maxValue) => Math.max(acc, maxValue), 0);
					
					const { pointsDict, preparedCoordinates } = App.prepareData(statsDataDict, maxValue);
					
					this.setState({
						pointsDict,
						preparedCoordinates,
						chartPoints: preparedCoordinates.reduce((acc, { x, y }) => acc.concat(`${x} ${y}`), []).join(', '),
						loading: false,
						success: true,
						statsDataDict,
						maxValue
					});
				})
				.catch(error => {
					console.warn('Тестовое завалено', error);
				});
		});
	};
	
	render() {
		const {
			statsDataDict,
			maxValue,
			loading,
			success,
			preparedCoordinates,
			pointsDict,
			chartPoints
		} = this.state;
		
		return (
			<main styleName='App'>
				<div styleName='container'>
					<h1>Dollar Rates Chart</h1>
					
					<Chart
						width={ WIDTH }
						height={ HEIGHT }
						offset={ OFFSET }
						pointsDict={ pointsDict }
						chartPoints={ chartPoints }
						preparedCoordinates={ preparedCoordinates }
						statsPopupSize={ STATS_POPUP_SIZE }
						chartLoaded={ success }
						chartFetching={ loading }
						data={ statsDataDict }
						maxValue={ maxValue }
					/>
					
					<button onClick={ this.fetchChartData }>Load new chart data</button>
				</div>
			</main>
		)
	}
}


export default App;

