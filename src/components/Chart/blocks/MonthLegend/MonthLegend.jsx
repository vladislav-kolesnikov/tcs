import React from 'react';
import PropTypes from 'prop-types';

function MonthLegend(props, ctx) {
	return (
		<g>
			{ props.stats.map((values, idx, arr) => {
					let offset = props.offset;
					let xCoordinate = idx * Math.round((props.canvasWidth / arr.length)) + offset / 2;
					let yCoordinate = props.canvasHeight - offset / 2;
					
					return (
						<text
							key={ idx }
							x={ xCoordinate }
							y={ yCoordinate }
							className={ props.className }
						>
							<tspan>{ props.formatter(values) }</tspan>
						</text>
					)
				}
			) }
		</g>
	)
}

MonthLegend.propTypes = {
	stats: PropTypes.array,
	canvasWidth: PropTypes.number,
	canvasHeight: PropTypes.number,
	offset: PropTypes.number,
	formatter: PropTypes.func.isRequired
};

export default MonthLegend;