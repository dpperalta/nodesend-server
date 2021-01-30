const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const enlacesController = require('../controllers/enlacesController');
const archivosController = require('../controllers/archivosController');
const auth = require('../middleware/auth');

router.post('/',
    [
        check('nombre', 'Se debe enviar un archivo').not().isEmpty(),
        check('nombreOriginal', 'Nombre de archivo inválido').not().isEmpty()
    ],
    auth,
    enlacesController.nuevoEnlace
);

router.get('/',
    enlacesController.todosEnlaces
);

router.get('/:url',
    enlacesController.tienePassword,
    enlacesController.obtenerEnlace
);

router.post('/:url',
    enlacesController.verificarPassword,
    enlacesController.obtenerEnlace
);

module.exports = router;