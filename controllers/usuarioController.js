const Usuario = require('../model/Usuario');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

exports.nuevoUsuario = async(req, res) => {

    // Errores de express
    const errores = validationResult(req);
    if( !errores.isEmpty() ){
        let arregloErrores = errores.array();
        let mensajes = '';
        // arregloErrores.map( err => {
        //     mensajes = mensajes + ' ' + err.msg;
        // } );

        for(let i=0; i<arregloErrores.length; i++){
            i > 0 ? mensajes = mensajes + ', ' + arregloErrores[i]['msg'] : mensajes = mensajes + arregloErrores[i]['msg'];
        }
        
        return res.status(400).json({
            ok: false,
            //errores: errores.array(),
            msg: 'Han ocurrido los siguientes errores: ' + mensajes
        });
    }

    // Validar usuarios registrados
    const { email, password } = req.body;

    let usuario = await Usuario.findOne({ email });
    if(usuario) {
        return res.status(400).json({
            ok: false,
            msg: 'El usuario ya está registrado'
        });
    }

    // Crear un nuevo usuario
    usuario = new Usuario(req.body);
    
    // Hashear el password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    try {
        await usuario.save();
    
        res.status(200).json({
            ok: true,
            msg: 'Usuario creado correctamente',
            usuario
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Ha ocurrido un error, contacte al administrador',
            error
        });
        console.log('Error:', error);
    }

    
}