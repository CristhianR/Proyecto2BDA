import mongoose from 'mongoose';

const Schema = mongoose.Schema;
 
let Cita = new Schema({
    Id: {
        type: Number
    },
    Fecha: {
        Dia: Number,
        Mes: Number,
        Año: Number,
        Hora: String
    },
    Especialidad: {
        type: String
    },
    CedulaPaciente: {
        type: Number,
    },
    Estado: { 
        type: String
    },
    InformacionAdicional: {
        type: String
    }
});

export default mongoose.model('Cita', Cita);