import React from 'react';
import PropTypes from 'prop-types';

function RateTriangle(props) {
	const x = props.x;
	const y = props.y;
	
	const topVertex = x + 70;
	const rightVertex = x + 76;
	const leftVertex = x + 64;
	
	const points = props.isGrowing
		? `${topVertex}, ${y + 28} ${rightVertex}, ${y + 40} ${leftVertex}, ${y + 40}`
		: `${topVertex}, ${y + 40} ${rightVertex}, ${y + 28} ${leftVertex}, ${y + 28}`;
	
	return (
		<polyline
			points={ points }
			fill={ props.isGrowing ? 'forestgreen' : 'red' }
		/>
	);
}

RateTriangle.propTypes = {
	x: PropTypes.number,
	y: PropTypes.number,
	isGrowing: PropTypes.bool
};

export default RateTriangle;