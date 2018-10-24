import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import CentroAtencion from './Models/CentroAtencion';
import Funcionario from './Models/Funcionario';
import Diagnostico from './Models/Diagnostico';
import Tratamiento from './Models/Tratamiento';
import Paciente from './Models/Paciente';
import Cita from './Models/Cita';
import { isNull } from 'util';

const app = express();
const router = express.Router();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/TECHealth');

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

//----------------------------------------------- End-points -----------------------------------------------------------
//----------------------------------------------- Consultas Administrador -----------------------------------------------------------

//----------------------------------------------- Consulta Cantidad de citas -----------------------------------------------------------
router.route('/cantidadcitas/:id/:id2').get((req,res) => {
    var cedula = 0;
    cedula = parseInt(req.params.id,10);
    if(req.params.id == 0 && req.params.id2 == 0){
        Cita.find((err, citas) => {
            if(err){
                console.log(err);
            }else{
                //----------------------------------------------- Consulta Primeros tres pacientes -----------------------------------------------------------
                Paciente.find((err, pacientes) => {
                    if(err){
                        console.log(err);
                    }else{
                        var arrayObj = [];
                        for(var index = 0; index < pacientes.length; index++){
                            var cedula = pacientes[index].Cedula;
                            var cantidad = 0;
                            for(var index2 = 0; index2 < citas.length; index2++){
                                if(cedula == citas[index2].CedulaPaciente && citas[index2].Estado == "Registrada"){
                                    cantidad++;
                                }
                            }
                            var nombre = pacientes[index].NombreCompleto;
                            var obj = { nombre, cantidad };
                            arrayObj[index] = obj;
                        }
                        console.log(arrayObj);
                        for(var index = 0; index < arrayObj.length; index++){
                            if(index == arrayObj.length-2){
                                break
                            }else{
                                if(arrayObj[index].cantidad < arrayObj[index+1].cantidad){
                                    var temp = arrayObj[index];
                                    arrayObj[index] =  arrayObj[index+1];
                                    arrayObj[index+1] = temp;
                                }else{
                                    if(arrayObj[index].cantidad < arrayObj[index+2].cantidad){
                                        var temp = arrayObj[index];
                                        arrayObj[index] =  arrayObj[index+2];
                                        arrayObj[index+2] = temp;
                                    }
                                }
                            }
                        }
                        res.json(arrayObj.slice(0,3));
                    }
                });    
            }
        });
    }else{
        if(!isNaN(cedula) && req.params.id2 == 0){
            Cita.find({CedulaPaciente: cedula}, (err, citas) =>  {
                if(err){
                    console.log(err);
                }else{
                    var total = citas.length;
                    res.json({citas, total})
                }
            });
        }else{
            if(req.params.id2 != 0){
                var data1 = "";
                var data2 = "";
                var time = 0;
                var dia1 = 0;
                var mes1 = 0;
                var año1 = 0;
                var dia2 = 0;
                var mes2 = 0;
                var año2 = 0;
                for(var index = 0; index < req.params.id2.length; index++){
                    if(req.params.id2[index] == ","){
                        if(time == 0){
                            dia1 = parseInt(data1);
                            dia2 = parseInt(data2);
                            time += 1;
                            data1 = "";
                            data2 = "";
                        }else{
                            if(time == 1){
                                mes1 = parseInt(data1);
                                mes2 = parseInt(data2);
                                time += 1;
                                data1 = "";
                                data2 = "";
                            }
                        }
                    }else{
                        data1 += req.params.id[index];
                        data2 += req.params.id2[index];
                        console.log(data1);
                        console.log(data2);
                        console.log("tiempo: " + time);
                        if(index == req.params.id2.length-1){
                            año1 = parseInt(data1);
                            año2 = parseInt(data2);
                            time = 0;
                            data1 = "";
                            data2 = "";
                        }
                    }
                }
                console.log("Rango de Fechas: " + dia1 + "/" + mes1 + "/" + año1 + "||" + dia2 + "/" + mes2 + "/" + año2);
                Cita.ensureIndexes({"Fecha.Dia":1,"Fecha.Mes":1,"Fecha.Año":1,"Fecha.Hora":1});
                Cita.find({"Fecha.Año":{ $gte: año1, $lte: año2}}, (err, citas) =>  {
                    if(err){
                        console.log(err);
                    }else{
                        for(var index = 0; index < citas.length; index++){
                            if((citas[index].Fecha.Mes < mes1 && citas[index].Fecha.Año == año1) || (citas[index].Fecha.Mes > mes2 && citas[index].Fecha.Año == año2)){
                                delete citas[index];
                            }else{
                                if(citas[index].Fecha.Dia < dia1 && citas[index].Fecha.Mes == mes1){
                                    delete citas[index];
                                }else{
                                    if(citas[index].Fecha.Dia > dia2 && citas[index].Fecha.Mes == mes2){
                                        delete citas[index];
                                    }
                                }  
                            }  
                        }
                        var cita = [];
                        var index2 = 0;
                        for(var index = 0; index < citas.length; index++){
                            if(citas[index] != undefined){
                                console.log(citas[index]);
                                cita[index2] = citas[index];
                                index2++;
                            }
                        }
                        var total = citas.length;
                        res.json({cita, total});
                    }
                });
            }else{
                Cita.find({ $or: [{Estado: req.params.id}, {Especialidad: req.params.id}]}, (err, citas) =>  {
                    if(err){
                        console.log(err);
                    }else{
                        var total = citas.length;
                        res.json({citas, total})
                    }
                });
            }
        }
    }
});

//----------------------------------------------- Consulta Enfermedades más Diagnosticadas -----------------------------------------------------------
router.route('/masdiagnosticadas').get((req, res) => {
    Paciente.find((err, pacientes) => {
        if(err){
            console.log(err);
        }else{
            var nombre = "";
            var cantidad = 0;
            var arrayObj = [];
            Diagnostico.find((err,enfermedad) => {
                if(err){
                    console.log(err);
                }else{
                    for(var index = 0; index < enfermedad.length; index++){
                        nombre = enfermedad[index].Nombre;
                        for(var index2 = 0; index2 < pacientes.length; index2++){
                            for(var index3 = 0; index3 < pacientes[index2].Diagnostico.length; index3++){
                                for(var index4 = 0; index4 < pacientes[index2].Diagnostico[index3].Diagnosticos.length; index4++){
                                    if(nombre == pacientes[index2].Diagnostico[index3].Diagnosticos[index4].Nombre){
                                        cantidad++;
                                    }
                                }
                            }
                        }
                        var obj = {nombre, cantidad};
                        arrayObj[index] = obj;
                        cantidad = 0;
                    }
                    console.log(arrayObj);
                     res.json(arrayObj);
                }
            });
        }
    });
});

//----------------------------------------------- Consulta Rango de Diagnosticos -----------------------------------------------------------
router.route('/rangoenfermedades').get((req, res) => {
    Paciente.find((err, pacientes) => {
        if(err){
            console.log(err);
        }else{
            var menos = 0;
            var mas = 0;
            var Rango = [];
            for(var index2 = 0; index2 < pacientes.length; index2++){
                for(var index3 = 0; index3 < pacientes[index2].Diagnostico.length; index3++){
                    if(index3 == 0){
                        menos = pacientes[index2].Diagnostico[index3].Diagnosticos.length;
                        mas = pacientes[index2].Diagnostico[index3].Diagnosticos.length;
                    }else{
                        mas = pacientes[index2].Diagnostico[index3].Diagnosticos.length;
                        if(mas < menos){
                            mas = menos;
                            menos = pacientes[index2].Diagnostico[index3].Diagnosticos.length;
                        }
                    }
                }
                var obj = {Nombre: pacientes[index2].NombreCompleto, rango: [menos, mas]};
                Rango[index2] = obj;
            }
            res.json(Rango);
        }
    });
});

//----------------------------------------------- Consulta Cantidad de Tratamientos y Promedio -----------------------------------------------------------
router.route('/tratamientosasignados').get((req, res) => {
    Paciente.find((err, pacientes) => {
        if(err){
            console.log(err);
        }else{
            var nombre = "";
            var cantidad = 0;
            var monto = 0;
            var arrayObj = [];
            Tratamiento.find((err,tratamiento) => {
                if(err){
                    console.log(err);
                }else{
                    for(var index = 0; index < tratamiento.length; index++){
                        nombre = tratamiento[index].Nombre;
                        //console.log(nombre);
                        for(var index2 = 0; index2 < pacientes.length; index2++){
                            for(var index3 = 0; index3 < pacientes[index2].Tratamientos.length; index3++){
                                if(nombre == pacientes[index2].Tratamientos[index3].Nombre){
                                    monto += tratamiento[index].MontoTratamiento;
                                    cantidad++;
                                }
                            }
                        }
                        console.log("Monto: " + monto);
                        var montoPromedio = monto/cantidad;
                        var obj = {nombre, cantidad, monto};
                        arrayObj[index] = obj;
                        cantidad = 0;
                        monto = 0;
                    }
                    console.log(arrayObj);
                     res.json(arrayObj);
                }
            });
        }
    });
});

//---------------------------------------- Métodos CRUD para el modelo CentroAtencion --------------------------------------------

// GET ALL
router.route('/centrosatencion').get((req, res) => {
    CentroAtencion.find((err, centrosAtencion) => {
        if(err){
            console.log(err);
        }else{
            res.json(centrosAtencion);
        }
    });
});

// GET byID
router.route('/centroatencion/:id').get((req, res) => {
    CentroAtencion.findById(req.params.id, (err, centroAtencion) => {
        if(err){
            console.log(err);
        }else{
            res.json(centroAtencion);
        }
    });
});

// POST
router.route('/centroatencion/add').post((req, res) => {
    let centroAtencion = new CentroAtencion(req.body);
    centroAtencion.save()
    .then(centroAtencion => {
        res.status(200).json({'centroAtencion': 'Added successfully'});
    })
    .catch(err => {
        res.status(400).send('Failed to create new record');
    });
});

// UPDATE
router.route('/centroatencion/update/:id').post((req, res) => {
    CentroAtencion.findById(req.params.id, (err, centroAtencion) => {
        if(!centroAtencion){
            return next(new Error('Could not load document'));
        }else{
            centroAtencion.CodigoCentro = req.body.CodigoCentro;
            centroAtencion.Nombre = req.body.Nombre;
            centroAtencion.Ubicacion = req.body.Ubicacion;
            centroAtencion.CapacidadMaxima = req.body.CapacidadMaxima;
            centroAtencion.TipoCentro = req.body.TipoCentro;
            
            centroAtencion.save().then(centroAtencion => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

// DELETE
router.route('/centroatencion/delete/:id').get((req, res) => {
    CentroAtencion.findByIdAndRemove({_id: req.params.id}, (err, centroAtencion) => {
        if(err){
            res.json(err);
        }else{
            res.json('Remove successfully');
        }
    })
})

//---------------------------------------- Métodos CRUD para el modelo Funcionario --------------------------------------------

// GET ALL
router.route('/funcionarios').get((req, res) => {
    Funcionario.find((err, funcionarios) => {
        if(err){
            console.log(err);
        }else{
            res.json(funcionarios);
        }
    });
});

// GET byID
router.route('/funcionario/:id').get((req, res) => {
    Funcionario.findById(req.params.id, (err, funcionario) => {
        if(err){
            console.log(err);
        }else{
            res.json(funcionario);
        }
    });
});

// POST
router.route('/funcionario/add').post((req, res) => {
    let funcionario = new Funcionario(req.body);
    funcionario.save()
    .then(funcionario => {
        res.status(200).json({'funcionario': 'Added successfully'});
    })
    .catch(err => {
        res.status(400).send('Failed to create new record');
    });
});

// UPDATE
router.route('/funcionario/update/:id').post((req, res) => {
    Funcionario.findById(req.params.id, (err, funcionario) => {
        if(!funcionario){
            return next(new Error('Could not load document'));
        }else{
            funcionario.Cedula = req.body.Cedula;
            funcionario.NombreCompleto.Nombre = req.body.NombreCompleto.Nombre;
            funcionario.NombreCompleto.Aepellido1 = req.body.NombreCompleto.Aepellido1;
            funcionario.NombreCompleto.Aepellido2 = req.body.NombreCompleto.Aepellido2;
            funcionario.FechaIngreso = req.body.FechaIngreso;
            funcionario.AreaTrabajo = req.body.AreaTrabajo;
            funcionario.CodigoUsuario = req.body.CodigoUsuario;
            funcionario.Password = req.body.Password;
            
            funcionario.save().then(funcionario => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

// DELETE
router.route('/funcionario/delete/:id').get((req, res) => {
    Funcionario.findByIdAndRemove({_id: req.params.id}, (err, funcionario) => {
        if(err){
            res.json(err);
        }else{
            res.json('Remove successfully');
        }
    })
})

//---------------------------------------- Métodos CRUD para el modelo Diagnostico --------------------------------------------

// GET ALL
router.route('/diagnosticos').get((req, res) => {
    Diagnostico.find((err, diagnosticos) => {
        if(err){
            console.log(err);
        }else{
            res.json(diagnosticos);
        }
    });
});

// GET byID
router.route('/diagnostico/:id').get((req, res) => {
    Diagnostico.findById(req.params.id, (err, diagnostico) => {
        if(err){
            console.log(err);
        }else{
            res.json(diagnostico);
        }
    });
});

// POST
router.route('/diagnostico/add').post((req, res) => {
    let diagnostico = new Diagnostico(req.body);
    diagnostico.save()
    .then(diagnostico => {
        res.status(200).json({'diagnostico': 'Added successfully'});
    })
    .catch(err => {
        res.status(400).send('Failed to create new record');
    });
});

// UPDATE
router.route('/diagnostico/update/:id').post((req, res) => {
    Diagnostico.findById(req.params.id, (err, diagnostico) => {
        if(!diagnostico){
            return next(new Error('Could not load document'));
        }else{
            diagnostico.Id = req.body.Id;
            diagnostico.Nombre = req.body.Nombre;
            diagnostico.Descripcion = req.body.Descripcion;
            diagnostico.Sintomas = req.body.Sintomas
            diagnostico.Tratamientos = req.body.Tratamientos;
            
            diagnostico.save().then(diagnostico => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

// DELETE
router.route('/diagnostico/delete/:id').get((req, res) => {
    Diagnostico.findByIdAndRemove({_id: req.params.id}, (err, diagnostico) => {
        if(err){
            res.json(err);
        }else{
            res.json('Remove successfully');
        }
    })
})

//---------------------------------------- Métodos CRUD para el modelo Tratamiento --------------------------------------------

// GET ALL
router.route('/tratamientos').get((req, res) => {
    Tratamiento.find((err, tratamientos) => {
        if(err){
            console.log(err);
        }else{
            res.json(tratamientos);
        }
    });
});

// GET byID
router.route('/tratamiento/:id').get((req, res) => {
    Tratamiento.findById(req.params.id, (err, tratamiento) => {
        if(err){
            console.log(err);
        }else{
            res.json(tratamiento);
        }
    });
});

// POST
router.route('/tratamiento/add').post((req, res) => {
    let tratamiento = new Tratamiento(req.body);
    tratamiento.save()
    .then(tratamiento => {
        res.status(200).json({'tratamiento': 'Added successfully'});
    })
    .catch(err => {
        res.status(400).send('Failed to create new record');
    });
});

// UPDATE
router.route('/tratamiento/update/:id').post((req, res) => {
    Tratamiento.findById(req.params.id, (err, tratamiento) => {
        if(!tratamiento){
            return next(new Error('Could not load document'));
        }else{
            tratamiento.Id = req.body.Id;
            tratamiento.Nombre = req.body.Nombre;
            tratamiento.Tipo = req.body.Tipo;
            tratamiento.Dosis = req.body.Dosis
            tratamiento.MontoTratamiento = req.body.MontoTratamiento;
            
            tratamiento.save().then(tratamiento => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

// DELETE
router.route('/tratamiento/delete/:id').get((req, res) => {
    Tratamiento.findByIdAndRemove({_id: req.params.id}, (err, tratamiento) => {
        if(err){
            res.json(err);
        }else{
            res.json('Remove successfully');
        }
    })
})

//---------------------------------------- Métodos CRUD para el modelo Paciente --------------------------------------------

// GET ALL
router.route('/pacientes').get((req, res) => {
    Paciente.find((err, pacientes) => {
        if(err){
            console.log(err);
        }else{
            res.json(pacientes);
        }
    });
});

// GET byID
router.route('/paciente/:id').get((req, res) => {
    Paciente.findById(req.params.id, (err, paciente) => {
        if(err){
            console.log(err);
        }else{
            res.json(paciente);
        }
    });
});

// POST
router.route('/paciente/add').post((req, res) => {
    let paciente = new Paciente(req.body);
    paciente.save()
    .then(paciente => {
        res.status(200).json({'paciente': 'Added successfully'});
    })
    .catch(err => {
        res.status(400).send('Failed to create new record');
    });
});

// UPDATE
router.route('/paciente/update/:id').post((req, res) => {
    Paciente.findById(req.params.id, (err, paciente) => {
        if(!paciente){
            return next(new Error('Could not load document'));
        }else{
            paciente.Cedula = req.body.Cedula;
            paciente.NombreCompleto.Nombre = req.body.NombreCompleto.Nombre;
            paciente.NombreCompleto.Aepellido1 = req.body.NombreCompleto.Aepellido1;
            paciente.NombreCompleto.Aepellido2 = req.body.NombreCompleto.Aepellido2;
            paciente.FechaNacimiento = req.body.FechaNacimiento;
            paciente.TipoSangre = req.body.TipoSangre;
            paciente.Nacionalidad = req.body.Nacionalidad;
            paciente.Ubicacion = req.body.Ubicacion;
            paciente.Telefonos = req.body.Telefonos;
            paciente.CodigoUsuario = req.body.CodigoUsuario;
            paciente.Password = req.body.Password;
            paciente.Diagnostico = req.body.Diagnostico;
            paciente.Tratamientos = req.body.Tratamientos;
            
            paciente.save().then(paciente => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

// DELETE
router.route('/paciente/delete/:id').get((req, res) => {
    Paciente.findByIdAndRemove({_id: req.params.id}, (err, paciente) => {
        if(err){
            res.json(err);
        }else{
            res.json('Remove successfully');
        }
    })
})

//---------------------------------------- Métodos CRUD para el modelo Cita --------------------------------------------

// GET ALL
router.route('/citas').get((req, res) => {
    Cita.find((err, citas) => {
        if(err){
            console.log(err);
        }else{
            res.json(citas);
        }
    });
});

// GET byID
router.route('/cita/:id').get((req, res) => {
    Cita.findById(req.params.id, (err, cita) => {
        if(err){
            console.log(err);
        }else{
            res.json(cita);
        }
    });
});

// POST
router.route('/cita/add').post((req, res) => {
    let cita = new Cita(req.body);
    cita.save()
    .then(cita => {
        res.status(200).json({'cita': 'Added successfully'});
    })
    .catch(err => {
        res.status(400).send('Failed to create new record');
    });
});

// UPDATE
router.route('/cita/update/:id').post((req, res) => {
    Cita.findById(req.params.id, (err, cita) => {
        if(!cita){
            return next(new Error('Could not load document'));
        }else{
            cita.Id = req.body.Id;
            cita.Fecha.Dia = req.body.Fecha.Dia;
            cita.Fecha.Mes = req.body.Fecha.Mes;
            cita.Fecha.Año = req.body.Fecha.Año;
            cita.Fecha.Hora = req.body.Fecha.Hora;
            cita.Especialidad = req.body.Especialidad;
            cita.CedulaPaciente = req.body.CedulaPaciente;
            cita.Estado = req.body.Estado;
            cita.InformacionAdicional = req.body.InformacionAdicional;
            
            cita.save().then(cita => {
                res.json('Update done');
            }).catch(err => {
                res.status(400).send('Update failed');
            });
        }
    });
});

// DELETE
router.route('/cita/delete/:id').get((req, res) => {
    Cita.findByIdAndRemove({_id: req.params.id}, (err, cita) => {
        if(err){
            res.json(err);
        }else{
            res.json('Remove successfully');
        }
    })
})

app.use('/', router);

app.get('/', (req, res) => res.send("Hello"));
app.listen(4000, () => console.log('Express server running on port 4000'));