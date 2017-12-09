import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import styles from './Chart.scss';
import MonthLegend from './blocks/MonthLegend';
import StatsPopup from './blocks/StatsPopup';
import $noop from 'lodash/noop';

const LEFT_DIR = 'left';
const RIGHT_DIR = 'right';

@CSSModules(styles, {
	allowMultiple: true,
	handleNotFoundStyleName: 'ignore'
})
class Chart extends PureComponent {
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
					x1={ 0 }
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
		/**
		 * NOTE:
		 * показывать попап можно в зависимости от направления движения,
		 * чтобы был виден гравик
		 */
		const { width, height, statsPopupWidth, statsPopupHeight } = this.props;
		const popupOffset = 8;
		const offsetX2 = popupOffset * 2;
		
		let popupX = x + popupOffset;
		let popupY = y - statsPopupHeight - popupOffset;
		
		if (popupX + statsPopupWidth - popupOffset > width) {
			popupX -= statsPopupWidth + offsetX2;
		}
		
		if (popupY + statsPopupHeight > height) {
			popupY -= statsPopupHeight + offsetX2;
		}
		
		if (popupY < 0) {
			popupY += Math.abs(popupY) + popupOffset;
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
		
		const { x, y } = currentStats;
		const { popupX, popupY } = this.getPopupCoords(x, y);
		const { statsPopupWidth, statsPopupHeight } = this.props;
		
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
					padding={ 10 }
					stats={ currentStats }
				/>
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