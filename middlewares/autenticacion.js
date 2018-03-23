var jwt = require('jsonwebtoken');
var _SEED = require('../config/config');

//====================================================
//		VALIDAR TOKEN
//====================================================

exports.verificaToken = function (req, res, next) {
    var token = req.headers.authorization;
  
    jwt.verify(token, _SEED.SEED, (err, decode) => {
  
      if(err){
        return res.status(401).send({
          ok: false,
          mensaje: "Token incorrecto",
          errors: err
        });
      }
      
      req.payload = decode.payload;      

      next();
      
    });
};


