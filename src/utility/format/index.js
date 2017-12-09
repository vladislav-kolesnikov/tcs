export function formatDate(date, locale = 'ru') {
	if (typeof date === 'number') {
		date = new Date(date);
	}
	
	return new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		year: 'numeric',
		month: 'long'
	}).format(date);
}

export function formatValue(val, currency, locale = 'ru') {
	return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(val);
}