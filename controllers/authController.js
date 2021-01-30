const Usuario = require('../model/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config({ path: 'variables.env' });

exports.autenticarUsuario = async(req, res, next) => {
    // Revisar si hay errores
    // Errores de express
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
    // Buscar el usuario para vaildar si está registrado
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if(!usuario) {
        res.status(401).json({
            ok: false,
            msg: 'El usuario no existe'
        });
        return next();
    }
    // Verificar el password e email
    if(bcrypt.compareSync(password, usuario.password)){
        // Crear JWT
        const token = jwt.sign({
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email
        }, process.env.SECRETA, {
            expiresIn: '8h'
        });
        res.status(200).json({
            ok: true,
            msg: 'Autenticación correcta',
            token
        })
    } else {
        res.status(401).json({
            ok: false,
            msg: 'Credenciales no válidas'
        });
        return next();
    }
}

exports.usuarioAutenticado = (req, res, next) => {
    
    res.status(200).json({
        ok: true,
        msg: 'Autentación correcta JWT',
        usuario: req.usuario
    });
}