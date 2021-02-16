require('dotenv').config();
const express = require('express'),
	  app     = express(),
	  bodyParser = require('body-parser'),
	  cors       = require('cors'),
	  expressSanitizer = require('express-sanitizer'),
	  mongoSanitize = require('express-mongo-sanitize'),
	  helmet = require('helmet'),
	  authRoutes = require('./routes/auth'),
	  transactionRoutes = require('./routes/transactions'),
	  accountRoutes = require('./routes/accounts'),
	  {redirectToHTTPS} = require('./middleware');

app.use(redirectToHTTPS);
app.use(cors());
app.use(bodyParser.json());
app.use(expressSanitizer());
app.use(mongoSanitize());
app.use(helmet());
app.use('/api/auth', authRoutes);
app.use('/api/accounts/:accountId/transactions/', transactionRoutes);
app.use('/api/accounts', accountRoutes);

app.use(function(req, res, next) {
	return res.status(404).json({error: 'Route not found'});
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));