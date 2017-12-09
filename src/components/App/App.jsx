import React, { PureComponent } from 'react';
import Chart from 'components/Chart';
import CSSModules from 'react-css-modules';
import styles from './App.scss';
import prepareChartData from 'utility/prepareChartData';
import stateHelper from 'utility/stateHelper';

const OFFSET = 40;
const WIDTH = 960;
const HEIGHT = WIDTH / 2;
const STATS_POPUP_WIDTH = 150;
const STATS_POPUP_HEIGHT = 50;

@CSSModules(styles, {
	allowMultiple: true,
	handleNotFoundStyleName: 'ignore'
})
class App extends PureComponent {
	static initialState = {
		coordinates: [],
		pointsDict: {},
		minValue: 0,
		maxValue: 0,
		xLegendData: [],
		polyLinePoints: ''
	};
	
	constructor(props, ctx) {
		super(props, ctx);
		
		this.state = {
			...App.initialState,
			...stateHelper.initial
		};
		
		this.onFulfilled = this.onFulfilled.bind(this);
	}
	
	componentDidMount() {
		this.fetchChartData();
	}
	
	fetchChartData = () => {
		this.setState(_ => ({
				...stateHelper.loading,
			...App.initialState,
			}),
			() => fetch('/api/charts')
				.then(res => res.json())
				.then(this.onFulfilled)
				.catch(error => console.warn('ERROR:', error))
		);
	};
	
	onFulfilled(originalData) {
		this.setState({
			...stateHelper.success,
			originalData,
			...prepareChartData({
				data: originalData,
				canvasWidth: WIDTH,
				canvasHeight: HEIGHT,
				canvasOffset: OFFSET
			})
		});
	};
	
	render() {
		const {
			pointsDict,
			minValue,
			maxValue,
			coordinates,
			polyLinePoints,
			xLegendData,
			loading,
			success
		} = this.state;
		
		return (
			<main styleName='App'>
				<div styleName='container'>
					<h1>Dollar Rates Chart</h1>
					
					<Chart
						chartLoaded={ success }
						chartFetching={ loading }
						
						width={ WIDTH }
						height={ HEIGHT }
						offset={ OFFSET }
						statsPopupWidth={ STATS_POPUP_WIDTH }
						statsPopupHeight={ STATS_POPUP_HEIGHT }
						
						xAxisLegendData={xLegendData}
						polyLinePoints={ polyLinePoints }
						pointsDict={ pointsDict }
						coordinates={ coordinates }
						maxValue={ maxValue }
						minValue={ minValue }
					/>
					
					<button onClick={ this.fetchChartData }>Load new chart data</button>
				</div>
			</main>
		)
	}
}


export default App;

