const jwt = require('jsonwebtoken');

function isUserLoggedIn(req, res, next){
	jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY, (err, decoded) => {
		if(err) {
			return res.json({message: 'Your token is invalid'});
		}
		if(Date.now()/1000 - decoded.iat > 3600) {
			return res.json({message: 'Your token has expired'});
		}
		next();
	});
}

function doesUserOwnResource(req, res, next){
	jwt.verify(req.headers.authorization.split(' ')[1], process.env.SECRET_KEY, (err, decoded) => {
		if(decoded.id != req.params.userId){
			return res.json({message: "You're not authorized to access that resource"});
		}
		next();
	});
}

module.exports = {isUserLoggedIn, doesUserOwnResource};