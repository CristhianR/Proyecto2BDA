import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Diagnostico = new Schema({
    Id: {
        type: String
    },
    Nombre: {
        type: String,
    },
    Descripcion: {
        type: String
    },
    Sintomas: {
        type: Array,
    },
    Tratamientos: { 
        type: Array
    }
});

export default mongoose.model('Diagnostico', Diagnostico);