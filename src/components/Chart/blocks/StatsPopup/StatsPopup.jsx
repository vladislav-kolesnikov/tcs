import React from 'react';

export default function StatsPopup(props) {
	let {
		x = 0,
		y = 0,
		width,
		height
	} = props;
	
	return (
		<g key='chart-data-popup'>
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
				fill='white'
				x={ x }
				y={ y }
				rx={ 3 }
				ry={ 3 }
				width={ width }
				height={ height }
				filter='url(#shadow)'
			/>
			{ props.children }
		</g>
	);
}

