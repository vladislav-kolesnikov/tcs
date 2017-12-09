import React, { PureComponent } from 'react';
import cls from 'classnames';
import CSSModules from 'react-css-modules';
import { formatValue, formatDate } from 'utility/format';
import styles from './StatsPopup.scss';

const isGrowingClassName = 'isGrowing';
const isFallingClassName = 'isFalling';

@CSSModules(styles, {
	allowMultiple: true,
	handleNotFoundStyleName: 'ignore'
})
class StatsPopup extends PureComponent {
	static renderTriangle(isGrowing, x, y) {
		const topVertex = x + 5;
		const rightVertex = x + 10;
		const leftVertex = x;
		const additionalClassName = isGrowing ? isGrowingClassName : isFallingClassName;
		
		const points = isGrowing
			? `${topVertex}, ${y} ${rightVertex}, ${y + 10} ${leftVertex}, ${y + 10}`
			: `${topVertex}, ${y + 10} ${rightVertex}, ${y} ${leftVertex}, ${y}`;
		
		return (
			<polyline
				points={ points }
				styleName={ additionalClassName }
			/>
		);
	}
	
	render() {
		let arrowNode;
		let coefficientNode;
		
		let {
			x = 0,
			y = 0,
			width,
			height,
			padding,
			stats
		} = this.props;
		
		const { timestamp, currency, growIndex } = stats;
		const { coefficient } = growIndex;
		const isGrowing = coefficient > 0;
		const additionalClassName = isGrowing ? isGrowingClassName : isFallingClassName;
		
		if (coefficient) {
			coefficientNode = (
				<tspan
					styleName={ cls('chart-popup-index', additionalClassName) }
					x={ 80 }
					y={ 0 }
				>
					{ coefficient.toFixed(2) }
				</tspan>
			);
			
			arrowNode = StatsPopup.renderTriangle(isGrowing, 66, 10);
		}
		
		return (
			<g key='chart-data-popup' transform={ `translate(${x} ${y})` }>
				<defs>
					<filter id="shadow">
						<feDropShadow
							dx='0'
							dy='1'
							stdDeviation='1'
							floodColor="#ccc"
						/>
					</filter>
				</defs>
				<rect
					styleName='StatsPopup'
					width={ width }
					height={ height }
					filter='url(#shadow)'
				/>
				<g transform={ `translate(${padding} ${padding * 2})` }>
					<text className='chart-popup-info'>
						<tspan styleName="chart-popup-date">
							{ formatDate(timestamp) }
						</tspan>
					</text>
					
					<text transform={ `translate(${0} ${20})` }>
						<tspan styleName='chart-popup-rate'>
							{ formatValue(currency, 'USD', 'en') }
						</tspan>
						{ coefficientNode }
					</text>
					
					{ arrowNode }
				</g>
			</g>
		);
	}
}

export default StatsPopup;

