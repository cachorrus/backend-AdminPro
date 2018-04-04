var express = require("express");
var Usuario = require("../models/usuario");
var bcrypt = require("bcryptjs");
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

/*======================================
    LISTADO DE USUARIOS
 =======================================*/
app.get("/", mdAutenticacion.verificaToken, (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, "nombre email img role")
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
    if (err) {
      return res.status(500).send({
        ok: false,
        mensaje: "Error cargando usuarios",
        errors: err
      });
    }

    Usuario.count({}, (err, conteo) => {
      
      if (err) {
        return res.status(500).send({
          ok: false,
          mensaje: "Error total usuarios",
          errors: err
        });
      }

      res.status(200).send({
        ok: true,
        usuarios: usuarios,
        total: conteo
      });
    });

    
  });
});

/*======================================
    ACTUALIZAR USUARIO
 =======================================*/
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).send({
        ok: false,
        mensaje: "Error al buscar el usuario con id: " + id,
        errors: err
      });
    }

    if (!usuario) {
      return res.status(400).send({
        ok: false,
        mensaje: "No se encontró el usuario con id: " + id,
        errors: { mensaje: "El usuario no existe" }
      });
    }

    /*
      si quieren evitar tener que hacer 
      usuario.nombre = body.nombre
    
      Simplemente ponen este pequeño código:
      
      Object.keys(req.body).forEach(key => {
      usuario[key] = req.body[key];
      });
    */

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;


    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).send({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err
        });
      }

      usuario.password = ';)';

      res.status(200).send({
        ok: true,
        usuario: usuarioGuardado,
        usuarioToken: req.payload
      });
    });
  });
});

/*======================================
    CREAR USUARIO
 =======================================*/
app.post("/", mdAutenticacion.verificaToken, (req, res, next) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).send({
        ok: false,
        mensaje: "Error al crear usuarios",
        errors: err
      });
    }

    res.status(201).send({
      ok: true,
      usuario: usuarioGuardado
    });
  });
});

//====================================================
//  BORRAR USUARIO
//====================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
  var id = req.params.id;
  
  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) =>{

    if(err){
      return res.status(500).send({
        ok:false,
        mensaje: "Error borrar usuario",
        errors: err
      });
    }

    if(!usuarioBorrado){
      return res.status(400).send({
        ok:false,
        mensaje: "No existe un usuario con el id:" + id,
        errors: { mensaje: "No existe el usuario"}
      });
    }

    usuarioBorrado.password=":(";

    res.status(200).send({
      ok: true,
      usuario: usuarioBorrado
    });
  });
});

module.exports = app;
