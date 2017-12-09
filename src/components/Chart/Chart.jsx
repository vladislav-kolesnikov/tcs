import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import styles from './Chart.scss';
import MonthLegend from './blocks/MonthLegend';
import StatsPopup from './blocks/StatsPopup';
import RateTriangle from './blocks/RateTriangle';
import $noop from 'lodash/noop';
import cls from 'classnames';
import { formatValue, formatDate } from 'utility/format';

const LEFT_DIR = 'left';
const RIGHT_DIR = 'right';

@CSSModules(styles, {
	allowMultiple: true,
	handleNotFoundStyleName: 'ignore'
})
class Chart extends Component {
	static defaultProps = {
		color: '#96bbd7'
	};
	
	static propTypes = {
		color: PropTypes.string,
		chartLoaded: PropTypes.bool,
		chartFetching: PropTypes.bool,
		width: PropTypes.number,
		height: PropTypes.number,
		offset: PropTypes.number,
		statsPopupWidth: PropTypes.number,
		statsPopupHeight: PropTypes.number,
		polyLinePoints: PropTypes.string,
		pointsDict: PropTypes.object,
		maxValue: PropTypes.number,
		minValue: PropTypes.number,
		xAxisLegendData: PropTypes.array
	};
	
	constructor(props, ctx) {
		super(props, ctx);
		
		this.state = {
			statsPopupIsVisible: false,
			currentPosition: {},
			currentStats: null,
			moveDirection: ''
		};
		
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
	}
	
	componentDidMount() {
		this.pt = this.svgNode.createSVGPoint();
	}
	
	drawXAxis() {
		const { width, offset, height, xAxisLegendData } = this.props;
		if (!xAxisLegendData) {
			return null;
		}
		
		return (
			<React.Fragment>
				<line
					key='x-axis'
					styleName='axis-line'
					x1={ offset }
					x2={ width }
					y1={ height - offset }
					y2={ height - offset }
				/>
				<MonthLegend
					canvasHeight={ height }
					canvasWidth={ width }
					offset={ offset }
					legendData={ xAxisLegendData }
					className={ styles['x-legend'] }
				/>
			</React.Fragment>
		)
	}
	
	_prevX = null;
	
	handleMouseMove(e) {
		e.persist();
		
		const cursorCoordinates = this.getCursorPoint(e);
		const currentX = cursorCoordinates.x;
		const statsData = this.props.pointsDict[currentX];
		const moveDirection = this._prevX > currentX ? LEFT_DIR : RIGHT_DIR;
		
		this.setState({
			currentPosition: cursorCoordinates,
			moveDirection,
			currentStats: statsData,
			statsPopupIsVisible: !!statsData,
		});
		
		this._prevStats = statsData;
		this._prevX = currentX;
	}
	
	handleMouseLeave() {
		this.setState(prevState => ({
			currentStats: prevState.currentStats,
			statsPopupIsVisible: false,
		}));
	}
	
	getCursorPoint(evt) {
		let pt = this.pt;
		pt.x = evt.clientX;
		pt.y = evt.clientY;
		return pt.matrixTransform(this.svgNode.getScreenCTM().inverse());
	}
	
	getPopupCoords(x, y) {
		const { width, height, offset, statsPopupWidth, statsPopupHeight } = this.props;
		
		let popupX = x + 10;
		let popupY = y + 10;
		
		if (popupX + statsPopupWidth - 10 > width - offset) {
			popupX = popupX - statsPopupWidth - 20;
		}
		
		if (popupY + statsPopupHeight > height - offset) {
			popupY = popupY - statsPopupHeight - 20;
		}
		
		return {
			popupX, popupY
		}
	}
	
	renderStatsPopup() {
		const { statsPopupIsVisible, currentStats } = this.state;
		
		if (!currentStats || !statsPopupIsVisible) {
			return null;
		}
		
		const { timestamp, currency, growIndex, x, y } = currentStats;
		const { popupX, popupY } = this.getPopupCoords(x, y);
		const { statsPopupWidth, statsPopupHeight } = this.props;
		const { coefficient } = growIndex;
		const isGrowing = coefficient > 0;
		
		let arrowNode;
		if (coefficient) {
			arrowNode = (
				<RateTriangle
					isGrowing={ isGrowing }
					x={ popupX }
					y={ popupY }
				/>
			)
		}
		
		return (
			<React.Fragment>
				<circle
					styleName={ 'rates-point' }
					cx={ x }
					cy={ y }
				/>
				<StatsPopup
					width={ statsPopupWidth }
					height={ statsPopupHeight }
					x={ popupX }
					y={ popupY }
				>
					<text className='chart-popup-info' fill='black' style={ { color: 'black' } }>
						<tspan styleName="chart-popup-date" x={ popupX + 10 } y={ popupY + 20 }>
							{ formatDate(timestamp) }
						</tspan>
						
						<tspan styleName="chart-popup-rate" x={ popupX + 10 } y={ popupY + 40 }>
							{ formatValue(currency, 'USD', 'en') }
						</tspan>
						
						{ coefficient && (
							<tspan
								styleName={ cls('chart-popup-index', isGrowing ? 'isGrowing' : 'isFalling') }
								x={ popupX + 80 }
								y={ popupY + 40 }
							>
								{ coefficient.toFixed(2) }
							</tspan>
						) }
					</text>
					{ arrowNode }
				</StatsPopup>
			</React.Fragment>
		)
	}
	
	renderChartLine() {
		const {
			chartLoaded,
			color,
			polyLinePoints,
			offset,
			height
		} = this.props;
		
		if (chartLoaded) {
			const { currentStats } = this.state;
			
			return (
				<React.Fragment>
					<g key='chart-mask'>
						{ currentStats && (
							<line
								styleName='chart-line'
								x1={ currentStats.x }
								y1={ currentStats.y }
								x2={ currentStats.x }
								y2={ height - offset }
							/>
						) }
					</g>
					
					<polyline
						// transform="translate(20 20)"
						key='chart-data-line'
						strokeWidth={ 2 }
						fill='none'
						stroke={ color }
						points={ polyLinePoints }
					/>
				</React.Fragment>
			);
		}
	}
	
	render() {
		const maskColor = '#f7f7f7';
		
		const {
			chartLoaded,
			width,
			height
		} = this.props;
		
		return (
			<div styleName='Chart'>
				<div styleName='container'>
					<svg
						styleName='canvas'
						ref={ node => this.svgNode = node }
						viewBox={ `0 0 ${width} ${height}` }
						width={ width }
						height={ height }
						style={ { backgroundColor: maskColor } }
						onMouseMove={ chartLoaded ? this.handleMouseMove : $noop }
						onMouseLeave={ chartLoaded ? this.handleMouseLeave : $noop }
					>
						{ this.drawXAxis() }
						{ this.renderChartLine() }
						{ this.renderStatsPopup() }
					</svg>
				</div>
			</div>
		);
	}
}

export default Chart;