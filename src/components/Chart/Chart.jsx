import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import styles from './Chart.scss';
import MonthLegend from './blocks/MonthLegend';
import getMonthName from 'utility/getMonthName';
import $memo from 'lodash/memoize';
import $noop from 'lodash/noop';

function formatDate(date) {
	if (typeof date === 'number') {
		date = new Date(date);
	}
	
	return new Intl.DateTimeFormat('ru').format(date)
}

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
		chartFetching: PropTypes.bool,
		chartLoaded: PropTypes.bool
	};
	
	constructor(props, ctx) {
		super(props, ctx);
		
		this.state = {
			statsPopupIsVisible: false,
			currentPosition: {},
		};
		
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.getCursorPoint = $memo(this.getCursorPoint);
		this.findPositionInRange = $memo(this.findPositionInRange);
	}
	
	static formatMonth(values) {
		return getMonthName(new Date(values.timestamp).getMonth())
	}
	
	componentDidMount() {
		this.pt = this.svgNode.createSVGPoint();
	}
	
	drawXAxis() {
		const { width, offset, height, data } = this.props;
		return [
			<line
				key='x-axis'
				styleName='axis-line'
				x1={ offset }
				x2={ width }
				y1={ height - offset }
				y2={ height - offset }
			/>,
			<MonthLegend
				key='x-legend'
				stats={ data }
				canvasWidth={ width }
				canvasHeight={ height }
				offset={ offset }
				formatter={ Chart.formatMonth }
				className={ styles['x-legend'] }
			/>
		]
	}
	
	handleMouseMove(e) {
		e.persist();
		
		const currentCursorCoordinates = this.getCursorPoint(e);
		this.setState({
			currentPosition: currentCursorCoordinates
		});
		
		this._throttledMouseMove(currentCursorCoordinates, this.props.pointsDict);
	}
	
	_throttledMouseMove(currentCursorCoordinates, pointsDict) {
		const x = currentCursorCoordinates.x;
		const statsData = pointsDict[x];
		
		if (statsData) {
			this.setState({
				statsPopupIsVisible: true,
				currentStats: statsData
			});
		}
	}
	
	findPositionInRange() {
		console.log(Object.values(this.state.pointsDict));
	}
	
	getCursorPoint(evt) {
		let pt = this.pt;
		pt.x = evt.clientX;
		pt.y = evt.clientY;
		return pt.matrixTransform(this.svgNode.getScreenCTM().inverse());
	}
	
	renderStatsPopup() {
		let { x, y, timestamp, growIndex } = this.state.currentStats;
		const { width, height, offset, statsPopupSize } = this.props;
		
		const ratesPointNode = (
			<circle
				styleName={ 'rates-point' }
				cx={ x }
				cy={ y }
			/>
		);
		
		y = y + 10;
		x = x + 10;
		
		if (x + statsPopupSize - 10 > width - offset) {
			x = x - statsPopupSize - 20;
		}
		
		if (y + statsPopupSize > height - offset) {
			y = y - statsPopupSize - 20;
		}
		
		return (
			<g key='chart-data-popup'>
				<rect
					fill='white'
					x={ x }
					y={ y }
					rx={ 3 }
					ry={ 3 }
					width={ statsPopupSize }
					height={ statsPopupSize }
					filter='url(#shadow)'
				>
					<text fill='black'>
						<tspan>{ formatDate(timestamp) }</tspan>
						<tspan>{ growIndex.coefficient }</tspan>
					</text>
				</rect>
				{ ratesPointNode }
			</g>
		)
	}
	
	render() {
		const maskColor = '#f7f7f7';
		
		const {
			color,
			chartLoaded,
			chartFetching,
			preparedCoordinates,
			chartPoints,
			offset,
			width,
			height
		} = this.props;
		
		let canvasContentNodes = [];
		if (chartLoaded) {
			const { currentPosition, statsPopupIsVisible } = this.state;
			const xCoord = currentPosition.x > offset ? currentPosition.x : offset;
			const { y: firstY } = preparedCoordinates[0];
			const { y: lastY } = preparedCoordinates[preparedCoordinates.length - 1];
			
			canvasContentNodes = [
				<g key='chart-mask'>
					<line
						styleName='chart-line'
						x1={ xCoord }
						y1={ 0 }
						x2={ xCoord }
						y2={ height - offset }
					/>
					
					<polygon
						fill={ maskColor }
						points={ `${offset - 1} 0, ${offset - 1} ${firstY} ${chartPoints}, ${width + 1} ${lastY}, ${width + 1} 0` }
					/>
				</g>,
				
				<polyline
					key='chart-data-line'
					strokeWidth={ 2 }
					fill='none'
					stroke={ color }
					points={ chartPoints }
				/>,
				statsPopupIsVisible && this.renderStatsPopup()
			];
		}
		
		
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
					>
						<defs>
							<filter id="shadow">
								<feDropShadow
									dx='0'
									dy='0'
									stdDeviation='1'
								/>
							</filter>
						</defs>
						{ canvasContentNodes }
						{ /*{ this.drawXAxis() }*/ }
					</svg>
				</div>
			</div>
		);
	}
}

export default Chart;