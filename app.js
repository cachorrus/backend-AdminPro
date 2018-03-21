// Requires
var express = require('express');
var colors = require('colors/safe');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();
const _PUERTO_API = 3000;
const _PUERTO_MONGODB = 27017;
const _BD_MONGO = 'hospitalDB';

//Conexion
//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:'+ _PUERTO_MONGODB + "/" + _BD_MONGO, (err, res) => {
    if (err) throw err;
    else {
        console.log('Conectado a MONGODB en el puerto: %s y BD: %s ', colors.green(_PUERTO_MONGODB), colors.yellow(_BD_MONGO)); // outputs green text
    }
    
});


// Rutas
app.get('/', (req, res, next) => {
    res.status(200).send( {
        ok: true,
        mensaje: 'Petición ejecutada correctamente',
    });
});


// Escuchar peticiones
app.listen(_PUERTO_API, () => {
    console.log('Express server corriendo en el puerto: %s', colors.green(_PUERTO_API)); // outputs green text
});