import React from 'react';
import PropTypes from 'prop-types';
import { X_AXIS_OFFSET_WIDTH, X_AXIS_OFFSET_LEFT } from 'constants-data';

function MonthLegend(props, ctx) {
	return (
		<g>
			{
				props.legendData.map((text, idx, arr) => {
					let offset = props.offset;
					const xCoordinate = idx * (props.canvasWidth * X_AXIS_OFFSET_WIDTH / arr.length) + props.canvasWidth * X_AXIS_OFFSET_LEFT;
					let yCoordinate = props.canvasHeight - offset / 2;
					
					return (
						<text
							key={ text }
							x={ xCoordinate + props.offset / 2 }
							y={ yCoordinate }
							className={ props.className }
						>
							<tspan>{ text }</tspan>
						</text>
					);
				})
			}
		</g>
	);
}

MonthLegend.propTypes = {
	legendData: PropTypes.array,
	canvasWidth: PropTypes.number,
	canvasHeight: PropTypes.number,
	offset: PropTypes.number,
	xLegendData: PropTypes.array
};

export default MonthLegend;