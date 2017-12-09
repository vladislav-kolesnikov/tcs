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
		console.log(e);
		return next(e);
	}
});

server.get(/.*/, restify.plugins.serveStatic({
	directory: path.resolve(__dirname, '../build'),
	default: 'index.html'
}));

let HOSTNAME = '0.0.0.0';
let PORT = process.env.PORT || 8080;

server.listen(PORT, HOSTNAME, () => {
	console.log('%s listening at %s', server.name, server.url);
	opn(`${server.url}`);
});

