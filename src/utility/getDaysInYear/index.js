export default function getDaysInYear(year) {
	return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year) {
	return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}