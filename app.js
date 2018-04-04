// Requires
var express = require('express');
var colors = require('colors/safe');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Inicializar variables
var app = express();
const _PUERTO_API = 3000;
const _PUERTO_MONGODB = 27017;
const _BD_MONGO = 'hospitalDB';


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cors
app.use(cors());
/*app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});*/

//Conexion
//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:'+ _PUERTO_MONGODB + "/" + _BD_MONGO, (err, res) => {
    if (err) throw err;
    else {
        console.log('Conectado a MONGODB en el puerto: %s y BD: %s ', colors.green(_PUERTO_MONGODB), colors.yellow(_BD_MONGO)); // outputs green text
    }
    
});



//====================================================
//		SERVER INDEX CONFIG - LISTADO DE ARCHIVOS DEL FILESYSTEM
//====================================================
//  var serveIndex = require('serve-index');
//  app.use(express.static(__dirname + '/'));
//  app.use('/uploads', serveIndex(__dirname + '/uploads'));


// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(_PUERTO_API, () => {
    console.log('Express server corriendo en el puerto: %s', colors.green(_PUERTO_API)); // outputs green text
});