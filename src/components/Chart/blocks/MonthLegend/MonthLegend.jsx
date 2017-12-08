import React from 'react';
import PropTypes from 'prop-types';

function MonthLegend(props, ctx) {
	return (
		<g>
			{
				props.legendData.map((text, idx, arr) => {
					let offset = props.offset;
					let xCoordinate = idx * Math.round((props.canvasWidth / arr.length)) + offset;
					let yCoordinate = props.canvasHeight - offset / 2;
					
					return (
						<text
							key={ idx }
							x={ xCoordinate }
							y={ yCoordinate }
							className={ props.className }
						>
							<tspan>{ text }</tspan>
						</text>
					);
				})
			}
		</g>
	)
}

MonthLegend.propTypes = {
	legendData: PropTypes.array,
	canvasWidth: PropTypes.number,
	canvasHeight: PropTypes.number,
	offset: PropTypes.number,
	xLegendData: PropTypes.array
};

export default MonthLegend;

/**
 ,
 <MonthLegend
 key='x-legend'
 data={  }
 canvasWidth={ width }
 canvasHeight={ height }
 offset={ offset }
 formatter={ formatMonth }
 className={ styles['x-legend'] }
 />
 */