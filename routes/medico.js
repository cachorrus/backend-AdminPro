var express = require("express");
var Medico = require("../models/medico");
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

/*======================================
    LISTADO DE MEDICOS
 =======================================*/
app.get("/", mdAutenticacion.verificaToken, (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
        
            if (err) {
                return res.status(500).send({
                    ok: false,
                    mensaje: "Error cargando medicos",
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
      
                if (err) {
                  return res.status(500).send({
                    ok: false,
                    mensaje: "Error total usuarios",
                    errors: err
                  });
                }

                res.status(200).send({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });            
    });
});


/*======================================
    CREAR MEDICO
 =======================================*/
 app.post("/", mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
  
    var medico = new Medico({
      nombre: body.nombre,
      img: body.img,
      usuario: req.payload._id,
      hospital: body.hospital
    });
  
    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).send({
          ok: false,
          mensaje: "Error al crear medico",
          errors: err
        });
      }
  
      res.status(201).send({
        ok: true,
        medico: medicoGuardado
      });
    });
});

//====================================================
//		OBTENER MEDICO
//====================================================
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img')
        .populate('hospital')
        .exec( (err, medico) => {

            if (err) {
                return res.status(500).send({
                    ok: false,
                    mensaje: "Error al buscar el médico con id: " + id,
                    errors: err
                });
            }
      
            if (!medico) {
                return res.status(400).send({
                    ok: false,
                    mensaje: "No se encontró el médico con id: " + id,
                    errors: { mensaje: "El médico no existe" }
                });
            }

            res.status(200).send({
                ok: true,                
                medico: medico
            });
        });
});        



/*======================================
    ACTUALIZAR MEDICO
 =======================================*/
 app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
  
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                mensaje: "Error al buscar el médico con id: " + id,
                errors: err
            });
        }
  
        if (!medico) {
            return res.status(400).send({
                ok: false,
                mensaje: "No se encontró el médico con id: " + id,
                errors: { mensaje: "El médico no existe" }
            });
        }
  
        medico.nombre = body.nombre;
        medico.usuario = req.payload._id;
        medico.hospital = body.hospital;
    
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).send({
                    ok: false,
                    mensaje: "Error al actualizar médico",
                    errors: err
                });
            }
  
            res.status(200).send({
                ok: true,
                medico: medicoGuardado,          
            });
        });
    });
});

//====================================================
//  BORRAR USUARIO
//====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    
    Medico.findByIdAndRemove(id, (err, medicoBorrado) =>{
  
        if(err){
            return res.status(500).send({
                ok:false,
                mensaje: "Error borrar medico",
                errors: err
            });
        }
  
        if(!medicoBorrado){
            return res.status(400).send({
                ok:false,
                mensaje: "No existe un medico con el id:" + id,
                errors: { mensaje: "No existe el medico"}
            });
        }       
  
        res.status(200).send({
            ok: true,
            medico: medicoBorrado
        });
    });
});
  

module.exports = app;