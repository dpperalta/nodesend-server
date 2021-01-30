const shortid = require('shortid');
const Enlace = require('../model/Enlace');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoEnlace = async(req, res, next) => {
    // Revisar si hay errores
    const errores = validationResult(req);
    if( !errores.isEmpty() ){
        let arregloErrores = errores.array();
        let mensajes = '';
        for(let i=0; i<arregloErrores.length; i++){
            i > 0 ? mensajes = mensajes + ', ' + arregloErrores[i]['msg'] : mensajes = mensajes + arregloErrores[i]['msg'];
        }
        
        return res.status(400).json({
            ok: false,
            msg: 'Han ocurrido los siguientes errores: ' + mensajes
        });
    }
    // Creando el enlace
    const { nombreOriginal, nombre } = req.body;
    const enlace = new Enlace();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
    enlace.nombreOriginal = nombreOriginal;
    // Validar si el usuario está autenticado
    if(req.usuario){
        const { password, descargas } = req.body;
        
        // Asingar valores a usuarios autenticados
        if(descargas){
            enlace.descargas = descargas;
        }
        // Asignar contraseña si es enviada
        if(password){
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
        }
        // Asignar autor
        enlace.autor = req.usuario.id;

    }

    // Guardar el enlace en la base de datos
    try {
        await enlace.save();
        return  res.status(200).json({
            ok: true,
            msg: 'Enlace creado satisfactoriamente',
            enlace: `${ enlace.url }`
        });
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Ha ocurrido un error al crear el enlace'
        });
    }
}

// Obtener todos los enlaces
exports.todosEnlaces = async (req, res) => {
    try {
        const enlaces = await Enlace.find({}).select('url -_id');
        return res.status(200).json({
            ok: true,
            msg: 'Todos los enlaes obtenidos satisfactoriamente',
            enlaces
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Ha ocurrido un error al crear el enlace'
        });
    }
}

// Obtener el enlace
exports.obtenerEnlace = async(req, res, next) => {
    const { url } = req.params;

    // Verificar si existe el enlace
    const enlace = await Enlace.findOne({
        url
    });
    if(!enlace){
        res.status(404).json({
            ok: false,
            msg: 'El enlace que busca, no existe'
        });
        return next();
    }

    // Si el enlace existe
    res.status(200).json({
        ok: true,
        msg: 'Enlace obtenido satisfactoriamente',
        archivo: enlace.nombre,
        password: false
    });
    next();
}

// Retorna sie el enlace tiene password
exports.tienePassword = async (req, res, next) => {
    const { url } = req.params;

    // Verificar si existe el enlace
    const enlace = await Enlace.findOne({
        url
    });
    if(!enlace){
        res.status(404).json({
            ok: false,
            msg: 'El enlace que busca, no existe'
        });
        return next();
    }

    if(enlace.password) {
        return res.status(200).json({
            ok: true,
            msg: 'Enlace con password obtenido satisfactoriamente',
            password: true,
            enlace: enlace.url
        }); 
    }
    next();
}

// Verifica si el password es correcto
exports.verificarPassword = async (req, res, next) => {
    const { url } = req.params;
    const { password } = req.body;

    // Consultar por el enlace
    const enlace = await Enlace.findOne({ url });

    // Verificar password
    if(bcrypt.compareSync( password, enlace.password )){
        // Permitir la descarga del archivo
        next();
    } else {
        return res.status(401).json({
            ok: false,
            msg: 'Password incorrecto, verifique'
        });
    }

}