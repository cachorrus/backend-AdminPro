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
async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: _CONFIG.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	//const userid = payload['sub'];
	// If request specified a G Suite domain:
	//const domain = payload['hd'];

	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.picture,
		google: true
	}
  }


app.post('/google', async (req, res, next) => {
	
	var token = req.body.token || '';
	var googleUser;

	try {
        googleUser = await verify(token);
    } catch (error) {
        return res.status(403).send({
            ok: false,
            mensaje: 'Token no válida',
            error: error.message
        });
	}
	
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
						payload: usuarioDB
					}, _CONFIG.SEED, {
						expiresIn: _CONFIG.CADUCIDAD_TOKEN
					});
				return res.status(200).send({
					ok: true,
					usuario: usuarioDB,
					token: token,
					id: usuarioDB._id,
					menu: obtenerMenu(usuarioDB.role)
				});
			}
		} else {
			// Si el usuario no existe en nuestra base de datos
			let usuario = new Usuario();
			usuario.nombre = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.img;
			usuario.google = googleUser.google;
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
						payload: usuarioDB
					}, _CONFIG.SEED, {
						expiresIn: _CONFIG.CADUCIDAD_TOKEN
					});
				return res.status(200).send({
					ok: true,
					usuario: usuarioDB,
					token: token,
					id: usuarioDB._id,
					menu: obtenerMenu(usuarioDB.role)
				});
			});
		}
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
			id: usuarioDB._id,
			menu: obtenerMenu(usuarioDB.role)
        });
    });

});


function obtenerMenu(role) {
	var menu = [
		{
		  titulo: 'Principal',
		  icono: 'mdi mdi-gauge',
		  submenu: [
		   { titulo: 'Dashboard', url: '/dashboard' },
		   { titulo: 'ProgressBar', url: '/progress' },
		   { titulo: 'Gráficas', url: '/graficas1' },
		   { titulo: 'Promesas', url: '/promesas' },
		   { titulo: 'RxJS', url: '/rxjs' },
		  ]
		},
		{
		  titulo: 'Mantenimientos',
		  icono: 'mdi mdi-folder-lock-open',
		  submenu: [
		   // { titulo: 'Usuarios', url: '/usuarios' },
		   { titulo: 'Hospitales', url: '/hospitales' },
		   { titulo: 'Médicos', url: '/medicos' },
		  ]
		}
	  ];

	if (role === 'ADMIN_ROLE') {
		menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' }) //unshift insert al inicio 
	}

	return menu;
}


module.exports = app;