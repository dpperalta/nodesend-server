const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/',
    [
        check('email', 'Se ha enviado un email inválido').isEmail(),
        check('password', 'El password es requerido').not().isEmpty()
    ],
    authController.autenticarUsuario
);
router.get('/',
    auth,
    authController.usuarioAutenticado
);

module.exports = router;