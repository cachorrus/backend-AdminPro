var express = require("express");
var mdAutenticacion = require('../middlewares/autenticacion');

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

var app = express();

/*======================================
   BUSCAR TODO
 =======================================*/
app.get("/todo/:busqueda", (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i'); // i caseInsensitive

    
    Promise.all([ 
            busquedaHospitales(regex), 
            busquedaMedicos(regex),
            busquedaUsuarios(regex)
        ])
        .then( resultados => {
            res.status(200).send({
                ok: true,
                hospitales: resultados[0],
                medicos: resultados[1],
                usuarios: resultados[2]
            });    
        }).catch( err => {
            res.status(400).send({
                ok: false,
                mensaje: 'Error en la busqueda',
                error: err
            });    
        });
});


/*======================================
   BUSCAR POR COLECCIÓN
 =======================================*/
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla.toLowerCase();    
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i'); // i caseInsensitive

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = busquedaUsuarios(regex);     
            break;

        case 'hospitales':
            promesa = busquedaHospitales(regex);
            break;
        
        case 'medicos':
            promesa = busquedaMedicos(regex);
            break;
    
        default:
            return res.status(400).send({
                ok: false,
                mensaje: 'No se encontró la colección',
                error: { mensaje: 'favor de definir una colección válida, sólo se permiten: usuarios, hospitales, medicos'}
            });
    }

    promesa.then(resultados => {
        res.status(200).send({
            ok: true,
            [tabla]: resultados //[tabla] escribe el el valor computado de la variable tabla (medicos, usuarios, hospitales)
        });
    }).catch( err => {
        res.status(400).send({
            ok: false,
            mensaje: 'Error al buscar ' + tabla,
            error: err
        });
    });

});


function busquedaHospitales (regex) {
    return new Promise((resolve, reject) => {
        
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
            
            if (err) {
                reject('Error cargando hospitales', err);
            }else {
                resolve(hospitales);
            }
        });
    });
}

function busquedaMedicos (regex) {
    return new Promise((resolve, reject) => {
        
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
            
            if (err) {
                reject('Error cargando medicos', err);
            }else {
                resolve(medicos);
            }
        });
    });
}

function busquedaUsuarios (regex) {
    return new Promise((resolve, reject) => {
        
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regex }, { email: regex}])
            .exec((err, usuarios) => {
            
            if (err) {
                reject('Error cargando usuarios', err);
            }else {
                resolve(usuarios);
            }
        });
    });
}

module.exports = app;
