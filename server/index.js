const opn = require('opn');
const restify = require('restify');
const path = require('path');
const generateStatsChart = require('./generate-stats');
const server = restify.createServer({
	name: 'Dollar Charts Data Generator',
	version: '1.0.0'
});
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser());

server.get('/api/charts', async (req, res, next) => {
	try {
		const stats = await generateStatsChart();
		res.header('content-type', 'json');
		res.send(stats);
		return next();
	} catch (e) {
		return next(e);
	}
});

server.get(/.*/, restify.plugins.serveStatic({
	directory: path.resolve(__dirname, '../build'),
	default: 'index.html'
}));

server.listen(8080, function () {
	console.log('%s listening at %s', server.name, server.url);
	opn('http://localhost:8080');
});

