import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Paciente = new Schema({
    Cedula: {
        type: Number
    },
    NombreCompleto: {
        Nombre: String,
        Apellido1: String,
        Apellido2: String
    },
    FechaNacimiento: {
        type: String
    },
    TipoSangre: {
        type: String,
    },
    Nacionalidad: { 
        type: String
    },
    Ubicacion: {
        type: String
    },
    Telefonos: {
        type: Array
    },
    CodigoUsuario: {
        type: String
    },
    Password: {
        type: String
    },
    Diagnostico :[{
        Cita: String,
        Diagnosticos: [{
        Nombre: String,
        Nivel: String,
        Observaciones: Array,
        }]
    }],
    Tratamientos: [{
      Nombre: String,
      CantidadDias: Number,
      EfectosSecundarios: Array  
    }]
});

export default mongoose.model('Paciente', Paciente);