import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let CentroAtencion = new Schema({
    CodigoCentro: {
        type: String
    },
    Nombre: {
        type: String
    },
    Ubicacion: {
        type: String
    },
    CapacidadMaxima: {
        type: Number,
    },
    TipoCentro: { 
        type: String
    }
});

export default mongoose.model('CentroAtencion', CentroAtencion);