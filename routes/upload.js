var express = require("express");
var mdAutenticacion = require('../middlewares/autenticacion');
var fileUpload = require('express-fileupload');
var _CONFIG = require('../config/config');
var fs = require('fs');

//modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

// default options
app.use(fileUpload());

/*======================================
    SUBIR ARCHIVOS
 =======================================*/
app.put("/:tipo/:id", (req, res, next) => {
    
    var tipo = req.params.tipo;
    var id= req.params.id;

    //tipos de coleccion
    var tiposValidos =  ['hospitales', 'usuarios', 'medicos'];

    if(tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).send({
            ok: false,
            mensaje: 'Tipo de coleccion no es válida',
            error: { mensaje: 'Tipo de coleccion no es válida' }
        });
    }

    if(!req.files){
        return res.status(400).send({
            ok: false,
            mensaje: 'No seleccionó nada',
            error: { mensaje: 'debe seleccionar una imagen'}
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado.pop().toLowerCase();

    //extensiones validas
    var extensionesValidas = ['png','jpg','jpeg','gif'];

    if(extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).send({
            ok: false,
            mensaje: 'Extensión no válida',
            error: { mensaje: 'Sólo se aceptan extensiones: ' + extensionesValidas.join(', ') }
        });
    }
    
    //nombre de archivo personalizado
    //123456456-123.png
    var nombreArchivo =  `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo }`; //template con backtrick Alt+96

    //mover el archivo del temporal a un path
    var path = `${ _CONFIG.PATH_UPLOAD }/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {
       
        if(err){
            return res.status(500).send({
                ok: false,
                mensaje: 'Error al mover el archivo',
                error: err
            });
        }

        return subirPorTipo(tipo, id, path, nombreArchivo, res);

    });

});


function subirPorTipo(tipo, id, path, nombreArchivo, res) {

    var tipoColeccion;

    switch (tipo) {
        case 'usuarios':
            tipoColeccion = Usuario;
            break;
        case 'medicos':
            tipoColeccion = Medico;
            break;
        case 'hospitales':
            tipoColeccion = Hospital;
            break;
        default:
            return res.status(400).send({
                ok: false,
                mensaje: 'TODO: funcionalidad para subir archivos a ' + tipo + ' no implementada',
                error: { mensaje: 'TODO: funcionalidad para subir archivos a ' + tipo + ' no implementada'}
            });        
    }

    return subirArchivo(tipoColeccion, tipo, id, path, nombreArchivo, res);

}

//=========================================================
//		ACTUALIZAR IMG EN BD Y BORRAR IMG ANTERIOR DEL FILESYSTEM
//=========================================================
function subirArchivo(tipoColeccion, tipo, id, path, nombreArchivo, res) {

    tipoColeccion.findById(id, 'nombre img').exec((err, resultado)=> {        

        if (err) {

            fs.unlink(path, err => {
                if (err){
                    console.log('error findById', err);
                }
            });

            return res.status(500).send({
                ok: false,
                mensaje: 'Error al buscar' + tipo,
                error: err
            });
        }

        if(!resultado){

            fs.unlink(path, err => {
                if (err){
                    console.log('no se encontró coleccion nada con ese id', err);
                }
            });

            return res.status(400).send({
                ok: false,
                mensaje: 'No se encontró nada con ese id',
                error: { mensaje: 'No se encontró nada con ese id' }
            });
        }

        var pathViejo = `${ _CONFIG.PATH_UPLOAD }/${ tipo }/${ resultado.img }`;

        //si existe eliminar la imagen anterior
        if(fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo, err => {
                if (err) {
                    console.log('eliminar imagen anterior', err);
                }
            });
        }

        resultado.img = nombreArchivo;

        resultado.save((err, resultadoActualizado) => {

            if(err){
                
                fs.unlink(path, err => {
                    if (err){
                        console.log('error save', err);
                    }
                });

                return res.status(500).send({
                    ok: false,
                    mensaje: 'Error al actualizar la imagen del ' + tipo,
                    error: err
                });  
            }                        

            return res.status(200).send({
                ok: true,
                mensaje: 'Imagen actualizada',
                [tipo]: resultadoActualizado
            });

        });

    });

}

module.exports = app;