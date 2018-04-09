var express = require("express");
var Usuario = require("../models/usuario");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
var _CONFIG = require('../config/config');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(_CONFIG.GOOGLE_CLIENT_ID, _CONFIG.GOOGLE_SECRET);

var app = express();

//====================================================
//		AUTENTICACION GOOGLE
//====================================================
app.post('/google', (req, res, next) => {
	
	var token = req.body.token || '';
	

	client.verifyIdToken({
        idToken: token,
        audience: _CONFIG.GOOGLE_CLIENT_ID
    }, (err, login) => {
		
		if(err){
			return res.status(403).send({
				ok: false,
				mensaje: 'Token no válida',
				error: err.message
			});
		}

		var googleUser = login.payload;
		//console.log(googleUser);

		//Buscar usuario google en BD
		Usuario.findOne({
			email: googleUser.email
		}, (err, usuarioDB) => {
			if (err) {
				return res.status(500).send({
					ok: false,
					mensaje: 'Error al buscar usuario - login',
					error:err
				});
			};
			if (usuarioDB) {
				if (usuarioDB.google === false) {
					return res.status(400).send({
						ok: false,
						err: {
							message: 'Debe de usar su autenticación normal'
						}
					});
				} else {
					let token = jwt.sign({
							usuario: usuarioDB
						}, _CONFIG.SEED, {
							expiresIn: _CONFIG.CADUCIDAD_TOKEN
						});
					return res.status(200).send({
						ok: true,
						usuario: usuarioDB,
						token: token,
						id: usuarioDB._id
					});
				}
			} else {
				// Si el usuario no existe en nuestra base de datos
				let usuario = new Usuario();
				usuario.nombre = googleUser.name;
				usuario.email = googleUser.email;
				usuario.img = googleUser.picture;
				usuario.google = true;
				usuario.password = ':)';

				usuario.save((err, usuarioDB) => {
					if (err) {
						return res.status(500).send({
							ok: false,
							mensaje: 'Error al crear usario - google',
							error: err
						});
					};
					let token = jwt.sign({
							usuario: usuarioDB
						}, _CONFIG.SEED, {
							expiresIn: _CONFIG.CADUCIDAD_TOKEN
						});
					return res.status(200).send({
						ok: true,
						usuario: usuarioDB,
						token: token,
						id: usuarioDB._id
					});
				});
			}
		});
	
	});
 
});


//====================================================
//		AUTENTUCACION NORMAL: LOGIN USUARIO
//====================================================
app.post('/', (req, res, next) => {

    var body = req.body;

    Usuario.findOne( { email: body.email },  (err, usuarioDB) => {

        if(err) {
            return res.status(500).send({
                ok: false,
                mensaje: "Error login usuario",
                error: err
            });
        }

        if(!usuarioDB) {
            return res.status(400).send({
                ok: false,
                mensaje: "Credenciales inválidas - email",
                error: err
            });
        }      

        if(!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).send({
                ok: false,
                mensaje: "Credenciales inválidas - password",
                error: err
            });
        }

        usuarioDB.password = ';)';
        var token = jwt.sign({ payload: usuarioDB}, _CONFIG.SEED, { expiresIn: _CONFIG.CADUCIDAD_TOKEN});

        res.status(200).send({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

});



module.exports = app;