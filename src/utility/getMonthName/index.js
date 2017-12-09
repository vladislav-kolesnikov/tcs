import { months } from 'constants-data';

export default (monthNumber) => {
	const month = months[monthNumber];
	if (!month) {
		throw new RangeError(`'${monthNumber}' месяца не существует`);
	}
	
	return month;
};