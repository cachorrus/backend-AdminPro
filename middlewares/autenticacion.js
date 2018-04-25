var jwt = require('jsonwebtoken');
var _CONFIG = require('../config/config');

//====================================================
//		VALIDAR TOKEN
//====================================================

exports.verificaToken = function (req, res, next) {
    var token = req.headers.authorization;
  
    jwt.verify(token, _CONFIG.SEED, (err, decode) => {
  
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

//====================================================
//		VALIDAR ROLE ADMIN
//====================================================
exports.verficaAdminRole = function (req, res, next) {
  var usuario = req.payload;

  if (usuario.role === 'ADMIN_ROLE') {
    next();
    return;
  } else {
    return res.status(401).send({
      ok: false,
      mensaje: "usuario no autorizado",
      errors: { message: 'usuario no autorizado'}
    });
  }  
}

//====================================================
//		VALIDAR ADMIN ROLE O MISMO USUARIO
//====================================================
exports.verificaAdminRole_o_mismoUsuario = function (req, res, next) {
  var usuario = req.payload;
  var id = req.params.id;

  if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
    next();
    return;
  } else {
    return res.status(401).send({
      ok: false,
      mensaje: 'usuario no autorizado',
      errors: {message: 'usuario no autorizado'}
    })
  }
}
