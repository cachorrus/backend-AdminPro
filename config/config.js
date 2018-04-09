
//seed para token jwt
const SEED = 'B@d_C@chorrus';
const CADUCIDAD_TOKEN = '4h'; 

//Ruta de archivos upload;
const PATH_UPLOAD = './uploads';
const PATH_USUARIOS = `${ PATH_UPLOAD }/usuarios`;
const PATH_HOSPITALES = `${ PATH_UPLOAD }/hospitales`;
const PATH_MEDICOS = `${ PATH_UPLOAD }/medicos`;

//Google
const GOOGLE_CLIENT_ID = '1013167702482-jc13fpeg67ihkkjagubla8qpov3frkpb.apps.googleusercontent.com';
const GOOGLE_SECRET = '5aT97oExjoAs48x9N--Rnj_S';

module.exports = {
    SEED: SEED,
    PATH_UPLOAD: PATH_UPLOAD,
    PATH_USUARIOS: PATH_USUARIOS,
    PATH_HOSPITALES: PATH_HOSPITALES,
    PATH_MEDICOS: PATH_MEDICOS,
    GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
    GOOGLE_SECRET: GOOGLE_SECRET,
    CADUCIDAD_TOKEN: CADUCIDAD_TOKEN
};