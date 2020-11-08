require('dotenv').config();
const express = require('express'),
	  app     = express(),
	  bodyParser = require('body-parser'),
	  authRoutes = require('./routes/auth');

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('Listening on port 3000'));


// ==== Routes ====
// ---- Auth ----
// Sign Up: /api/auth/signup
// Sign In: /aoi/auth/signin

// ---- Transactions ----
// Get Transactions: /api/transactions/userId
// Show Transactions: /api/transactions/userId/transactionId
// Create Transaction: /api/transactions/userId