var express = require("express");
var Usuario = require("../models/usuario");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
var _SEED = require('../config/config');

var app = express();

//====================================================
//		LOGIN USUARIO
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
        var token = jwt.sign({ payload: usuarioDB}, _SEED.SEED, { expiresIn: '4h'});

        res.status(200).send({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

});



module.exports = app;