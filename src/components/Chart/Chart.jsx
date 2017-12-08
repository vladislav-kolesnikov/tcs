import React, { Component } from 'react';
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import styles from './Chart.scss';
import MonthLegend from './blocks/MonthLegend';
import $memo from 'lodash/memoize';
import $noop from 'lodash/noop';

function formatDate(date) {
	if (typeof date === 'number') {
		date = new Date(date);
	}
	
	return new Intl.DateTimeFormat('ru').format(date)
}

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
		statsPopupSize: PropTypes.number,
		polyLinePoints: PropTypes.string,
		pointsDict: PropTypes.object,
		maxValue: PropTypes.number,
		minValue: PropTypes.number,
		xLegendData: PropTypes.array
	};
	
	constructor(props, ctx) {
		super(props, ctx);
		
		this.state = {
			statsPopupIsVisible: false,
			currentPosition: {},
			currentStats: {
				growIndex: {}
			}
		};
		
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
	}
	
	componentDidMount() {
		this.pt = this.svgNode.createSVGPoint();
	}
	
	componentWillReceiveProps(nextProps) {
		console.log(nextProps.pointsDict)
	}
	
	drawXAxis() {
		const { width, offset, height, xLegendData } = this.props;
		return (
			<React.fragment>
				<line
					key='x-axis'
					styleName='axis-line'
					x1={ offset }
					x2={ width }
					y1={ height - offset }
					y2={ height - offset }
				/>
			
			</React.fragment>
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
			moveDirection: moveDirection,
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
	
	renderStatsPopup() {
		const currentStats = this.state.currentStats;
		
		let {
			x = 0,
			y = 0,
			timestamp,
			growIndex,
			currency
		} = currentStats;
		
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
					<text fill='black' style={{ color: 'black' }}>
						{ currency }
						{ formatDate(timestamp) }
						{ growIndex.coefficient }
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
			coordinates,
			polyLinePoints,
			offset,
			width,
			height
		} = this.props;
		
		let canvasContentNodes;
		if (chartLoaded) {
			const { currentPosition, statsPopupIsVisible } = this.state;
			const xCoord = currentPosition.x > offset ? currentPosition.x : offset;
			const { y: firstY } = coordinates[0];
			const { y: lastY } = coordinates[coordinates.length - 1];
			
			canvasContentNodes = (
				<React.Fragment>
					<g key='chart-mask'>
						<line
							styleName='chart-line'
							x1={ xCoord }
							y1={ 0 }
							x2={ xCoord }
							y2={ height - offset }
						/>
						
						<polygon
							// transform="translate(20 20)"
							fill={ maskColor }
							points={ `${offset - 1} 0, ${offset - 1} ${firstY} ${polyLinePoints}, ${width + 1} ${lastY}, ${width + 1} 0` }
						/>
					</g>
					
					<polyline
						// transform="translate(20 20)"
						key='chart-data-line'
						strokeWidth={ 2 }
						fill='none'
						stroke={ color }
						points={ polyLinePoints }
					/>
					
					{ statsPopupIsVisible && this.renderStatsPopup() }
				</React.Fragment>
			)
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
						onMouseLeave={ chartLoaded ? this.handleMouseLeave : $noop }
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