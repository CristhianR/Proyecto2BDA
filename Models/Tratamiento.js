import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Tratamiento = new Schema({
    Id: {
        type: String
    },
    Nombre: {
        type: String,
    },
    Tipo: {
        type: String
    },
    Dosis: {
        type: String,
    },
    MontoTratamiento: { 
        type: Number
    }
});

export default mongoose.model('Tratamiento', Tratamiento);