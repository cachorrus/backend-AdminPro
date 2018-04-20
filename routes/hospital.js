var express = require("express");
var Hospital = require("../models/hospital");
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

/*======================================
    LISTADO DE HOSPITALES
 =======================================*/
app.get("/", (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
          .skip(desde)
          .limit(5)
          .populate('usuario','nombre email')
          .exec((err, hospitales) => {

    if (err) {
      return res.status(500).send({
        ok: false,
        mensaje: "Error cargando hospitales",
        errors: err
      });
    }

    Hospital.count({}, (err, conteo) => {
      
      if (err) {
        return res.status(500).send({
          ok: false,
          mensaje: "Error total usuarios",
          errors: err
        });
      }

      res.status(200).send({
        ok: true,
        hospitales: hospitales,
        total: conteo
      });
    });    
  });
});

/*======================================
    ACTUALIZAR HOSPITAL
 =======================================*/
 app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
  
    Hospital.findById(id, (err, hospital) => {
      if (err) {
        return res.status(500).send({
          ok: false,
          mensaje: "Error al buscar el hospital con id: " + id,
          errors: err
        });
      }
  
      if (!hospital) {
        return res.status(400).send({
          ok: false,
          mensaje: "No se encontró el hospital con id: " + id,
          errors: { mensaje: "El hospital no existe" }
        });
      }
   
      hospital.nombre = body.nombre;
      hospital.usuario =  req.payload._id;

       
      hospital.save((err, hospitalGuardado) => {
        if (err) {
          return res.status(400).send({
            ok: false,
            mensaje: "Error al actualizar hospital",
            errors: err
          });
        }
  
        hospital.password = ';)';
  
        res.status(200).send({
          ok: true,
          hospital: hospitalGuardado,
          usuarioToken: req.payload
        });
      });
    });
  });


  /*======================================
    CREAR HOSPITAL
 =======================================*/
app.post("/", mdAutenticacion.verificaToken, (req, res, next) => {
    var body = req.body;
  
    var hospital = new Hospital({
      nombre: body.nombre,      
      img: body.img,
      usuario: req.payload._id
    });
  
    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).send({
          ok: false,
          mensaje: "Error al crear hospital",
          errors: err
        });
      }
  
      res.status(201).send({
        ok: true,
        hospital: hospitalGuardado
      });
    });
});

//====================================================
//  BORRAR HOSPITAL
//====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) =>{
  
      if(err){
        return res.status(500).send({
          ok:false,
          mensaje: "Error borrar hospital",
          errors: err
        });
      }
  
      if(!hospitalBorrado){
        return res.status(400).send({
          ok:false,
          mensaje: "No existe un hospital con el id:" + id,
          errors: { mensaje: "No existe el hospital"}
        });
      }     
  
      res.status(200).send({
        ok: true,
        hospital: hospitalBorrado
      });
    });
});

// ========================================== 
//  Obtener Hospital por ID 
// ========================================== 
app.get('/:id', (req, res) => {

  var id = req.params.id;
  
  Hospital.findById(id)
    .populate('usuario', 'nombre img email')
    .exec((err, hospital) => {
  
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar hospital',
          errors: err
        });
      }
    
      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El hospital con el id ' + id + ' no existe',
          errors: {
            message: 'No existe un hospital con ese ID'
          }
        });
      }
    
      res.status(200).json({
        ok: true,
        hospital: hospital
      });    
  });
});

module.exports = app;