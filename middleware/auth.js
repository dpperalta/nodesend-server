const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(authHeader){
        // Obtener token
        const token = authHeader.split(' ')[1];
        // Comprobar token
        try {
            const usuario = jwt.verify(token, process.env.SECRETA);
            req.usuario = usuario;    
        } catch (error) {
            res.status(401).json({
                ok: false,
                msg: 'Credenciales incorrectas'
            });
        }
    } 
    return next();
}