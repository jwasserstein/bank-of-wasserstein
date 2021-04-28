const app = require('./server');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/bank-of-wasserstein', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, keepAlive: true});
const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));