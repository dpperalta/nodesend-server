const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

// Crea el servidor
const app = express();

console.log('Iniciando servidor...');

// Inicia la conexión con la base de datos
conectarDB();

// Habilitar CORS
const opcionesCors = {
    origin: process.env.FRONTEND_URL
}
app.use(cors(opcionesCors));

// Inicializa el puerto de conexión del servidor
const port = process.env.PORT || 4000;

// Habilitar leer los valores del body
app.use(express.json());

// Habilitar carpeta pública
app.use(express.static('uploads'));

// Rutas de la api
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/enlaces', require('./routes/enlaces'));
app.use('/api/archivos', require('./routes/archivos'));

// Inicia la aplicación
app.listen(port, '0.0.0.0', () => {
    console.log('Servidor corriendo en el puerto ' + port);
});