const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlace = require('../model/Enlace');

exports.subirArchivo = async(req, res, next) => {

    const configuracionMulter = {
        limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null, __dirname + '/../uploads')
            },
            filename: (req, file, cb) => {
                //const extension = file.mimetype.split('/')[1];
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${ shortid.generate() }${ extension }`);
            },
            // Restringir tipos de archivos
            /* fileFileter: (req, file, cb) => {
                if(file.mimetype === 'application/pdf') {
                    return cb(null, true);
                }
            } */
        })
    }

    const upload = multer( configuracionMulter ).single('archivo');

    upload(req, res, async(error) => {
        console.log(req.file);
        if(!error) {
            res.status(200).json({
                ok: true,
                msg: 'Archivo subido satisfactoriamente',
                archivo: req.file.filename
            })
        } else {
            res.status(500).json({
                ok: false,
                msg: 'Ha ocurrido un error: ' + error
            });
            return next();
        }
    })
}

exports.eliminarArchivo = async(req, res) => {
    
    try {
        fs.unlinkSync(__dirname + `/../uploads/${ req.archivo }`);
        console.log('Archivo eliminado:gi' + req.archivo);
    } catch (error) {
        console.log('Error');
    }
}

// Descarga un archivo
exports.descargar = async (req, res, next) => {
    
    const { archivo } = req.params;
    const enlace = await Enlace.findOne({ nombre: archivo });

    const archivoDescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarga);

    // Eliminar el archivo y la entrada de la base de datos
    // Si las descargas son iguales a 1, se debe borrar entrada y eliminar el archivo
    const { descargas, nombre } = enlace;
    if(descargas === 1) {
        // Eliminar el archivo del FS
        req.archivo = nombre;
        // Eliminar dde la base de datos
        await Enlace.findOneAndRemove(enlace.id);
        next();
    } else {
        // Si las descargas son mayores a 1, se debe restar una descarga
        enlace.descargas--;
        await enlace.save();
    }
}