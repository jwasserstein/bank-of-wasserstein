const jwt = require('jsonwebtoken');

function isUserLoggedIn(req, res, next){
	if(!req.headers.authorization){
		return res.status(401).json({error: 'Please log in first'});
	}
	jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY, (err, decoded) => {
		if(err) {
			return res.status(401).json({error: 'Your token is invalid'});
		}
		if(Date.now()/1000 - decoded.iat > 3600) {
			return res.status(401).json({error: 'Your token has expired'});
		}
		return next();
	});
}

function doesUserOwnResource(req, res, next){
	jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY, (err, decoded) => {
		if(decoded.id != req.params.userId){
			return res.status(401).json({error: "You're not authorized to access that resource"});
		}
		return next();
	});
}

module.exports = {isUserLoggedIn, doesUserOwnResource};