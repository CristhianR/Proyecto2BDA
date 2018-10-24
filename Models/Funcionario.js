import mongoose from 'mongoose';

const Schema = mongoose.Schema;

let Funcionario = new Schema({
    Cedula: {
        type: Number
    },
    NombreCompleto: {
        Nombre: String,
        Apellido1: String,
        Apellido2: String
    },
    TipoFuncionario: {
        type: String
    },
    FechaIngreso: {
        type: String,
    },
    AreaTrabajo: { 
        type: String
    },
    CodigoUsuario: {
        type: String
    },
    Password: {
        type: String
    }
});

export default mongoose.model('Funcionario', Funcionario);