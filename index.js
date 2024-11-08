const express = require('express');//importar express
const fs = require('fs');//importar fs para leer y escribr archivos
const bodyParser = require('body-parser');
const bodyP = bodyParser.json();
const app = express();//Inicializamos al app con express
app.use(bodyP);
const port = 3000;//Definir el puerto donde va a correr el sv.

//Leer datos de un json
const leerDatos = () => {
    try {
        const datos = fs.readFileSync("./datos.json"); //leer el archivo datos.json 
        return JSON.parse(datos);//convierte los datos en formato json y los retorna
    } catch (error) {
        console.log(error);//si hay algun error al leer datos los muestra en la consola
    }
};

//Escribir datos en un json
const escribir = (datos) => {
    try {
        fs.writeFileSync("./datos.json", JSON.stringify(datos)); //escrbie los datos en formato JSON, en el archivo datos.json
    } catch (error) {
        console.log(error);//si hay algun error al escribir datos los muestra en la consola
    }
};

//Ruta principal
app.get('/', (req, res) => {
    res.send("🍾 API TRABAJO FINAL 🍾");
});

//-------------------CURSOS-----------------------
//Listar todos los cursos
app.get('/ListarCursos', (req, res) => { //endpoint para listar todos los cursos
    const datos = leerDatos();//lee los datos del archivo json
    res.json(datos.cursos);//devuelve la lista de cursos
});

//Buscar curso por ID
app.get('/BuscarCurso/:id', (req, res) => {
    const datos = leerDatos();
    const id = parseInt(req.params.id);// recupera el id puesto por parametro
    const curso = datos.cursos.find((curso) => curso.idCurso === id); //busca el id del curso en la lista
    if (curso) {
        res.json(curso);//si encuentra el curso lo devuelve 
    } else {
        res.status(404).send("Curso no encontrado."); //si no lo encuentra muestra este mensaje
    }
});

//Crear curso
app.post('/SubirCurso', (req, res) => {
    const datos = leerDatos();
    let cursos = datos.cursos;
    let nuevoCursoId;
    if (cursos.length > 0) { //comprueba si hay cursos
        nuevoCursoId = cursos[cursos.length - 1].idCurso + 1; //si hay cursos se le genera un ID 
    }
    else { //si no hay cursos
        nuevoCursoId = 1; //se le da el id 1 al primer curso
    }
    const body = req.body; //recupera el cuerpo de la solicitud
    const nuevoCurso = { //se crea el nuevo curso con los datos del body y algunos valores predetermiandos.
        idCurso: nuevoCursoId,
        ...body,
        cantidadAlumnos: 0,
        cantidadModulos: 0,
    };
    datos.cursos.push(nuevoCurso);//agrega el nuevo curso a la lista
    escribir(datos); //escribe los nuevos datos en el archivo
    res.json(nuevoCurso); //muestra el curso creado
});

//Actualizar curso
app.put('/ActualizarCurso/:id', (req, res) => {
    const datos = leerDatos();
    const body = req.body;//recupera el cuerpo de la solicitud
    const id = parseInt(req.params.id);// recupera el id puesto por parametro
    const buscarIndex = datos.cursos.findIndex((curso) => curso.idCurso === id); //busca el id del curso en la lista
    datos.cursos[buscarIndex] = {//actualiza el curso con los nuevos datos
        ...datos.cursos[buscarIndex],
        ...body,
    };
    escribir(datos);//escribe los nuevos datos en el archivo
    res.json({ message: "Curso actualizado" }); //muestra un msj 
});

//Cambiar estado del curso
app.delete('/EstadoCurso/:id', (req, res) => {
    const datos = leerDatos();
    const id = parseInt(req.params.id);
    const curso = datos.cursos.find((curso) => curso.idCurso === id);
    if (curso) {
        let estado = curso.estado;//recupera el estado del curso
        if (estado === "INACTIVO") {//segun el estado del curso va a cambiar entre activo/inactivo
            curso.estado = "ACTIVO"
        }
        else {
            curso.estado = "INACTIVO"
        }
        escribir(datos);//escribe los nuevos datos en el archivo
        res.json({ message: `${curso.nombre} cambio a ${curso.estado}` });
    }
    else {
        res.status(500).send("Curso no encontrado.");//si hay un error muestra este msj
    }
});

//-------------------PROFESORES-----------------------
//Listar todos los profesores
app.get('/ListarProfesores', (req, res) => {
    const datos = leerDatos();
    res.json(datos.profesores);
});

//Buscar profesor por DNI
app.get('/BuscarProfesor/:dni', (req, res) => {
    const datos = leerDatos();
    const dni = parseInt(req.params.dni);// recupera el dni puesto por parametro
    const profesor = datos.profesores.find((profesor) => profesor.dni === dni);
    if (profesor) {
        res.json(profesor);
    } else {
        res.status(404).send("Profesor no encontrado.");
    }
});

//Crear profesor
app.post('/SubirProfesor', (req, res) => {
    const datos = leerDatos();
    let profesores = datos.profesores;
    const body = req.body;
    //Verifica que el dni no exista
    const dniExistente = profesores.find(profesor => profesor.dni === body.dni);//compara los dni de los profesores ya existentes con el nuevo dni que se quiere ingresar
    if (dniExistente) { //En caso que exista salta este mensaje
        return res.status(400).send({ message: "El DNI ya existe, no se puede crear el profesor." });
    }
    const nuevoProfesor = {//si el dni no existe, se crea el nuevo profesor
        ...body
    };
    datos.profesores.push(nuevoProfesor);
    escribir(datos);
    res.json(nuevoProfesor);
});

//Actualizar profesor
app.put('/ActualizarProfesor/:dni', (req, res) => {
    const datos = leerDatos();
    const body = req.body;
    const dni = parseInt(req.params.dni);
    const buscarIndex = datos.profesores.findIndex((profesor) => profesor.dni === dni);
    datos.profesores[buscarIndex] = {
        ...datos.profesores[buscarIndex],
        ...body,
    };
    escribir(datos);
    res.json({ message: "Profesor actualizado" });
});

//Cambiar estado del profesor
app.delete('/EstadoProfesor/:dni', (req, res) => {
    const datos = leerDatos();
    const dni = parseInt(req.params.dni);
    const profesor = datos.profesores.find((profesor) => profesor.dni === dni);
    if (profesor) {
        let estado = profesor.estado;
        if (estado === "INACTIVO") {
            profesor.estado = "ACTIVO";
        }
        else {
            profesor.estado = "INACTIVO"
        }
        escribir(datos);
        res.json({ message: `El profesor ${profesor.nombre} cambio a ${profesor.estado}` });
    }
    else {
        res.status(500).send("Profesor no encontrado");
    }
});

//-------------------MODULOS-----------------------
//Listar todos los modulos
app.get('/ListarModulos', (req, res) => {
    const datos = leerDatos();
    res.json(datos.modulos);
});
//Buscar modulo por ID
app.get('/BuscarModulo/:id', (req, res) => {
    const datos = leerDatos();
    const id = parseInt(req.params.id);// recupera el id puesto por parametro
    const modulo = datos.modulos.find((modulo) => modulo.idModulo === id);
    if (modulo) {
        res.json(modulo);
    } else {
        res.status(404).send("Modulo no encontrado.");
    }
});
//Crear modulo
app.post('/SubirModulo', (req, res) => {
    const datos = leerDatos();
    let modulos = datos.modulos;
    let nuevoModuloId;
    if (modulos.length > 0) {
        nuevoModuloId = modulos[modulos.length - 1].idModulo + 1;
    }
    else {
        nuevoModuloId = 1;
    }
    const body = req.body;
    const nuevoModulo = {
        idModulo: nuevoModuloId,
        ...body,
        idCurso: null, //se crea el modulo sin tener un curso asignado
    };
    datos.modulos.push(nuevoModulo);
    escribir(datos);
    res.json(nuevoModulo);
});

//Actualizar modulo
app.put('/ActualizarModulo/:id', (req, res) => {
    const datos = leerDatos();
    const body = req.body;
    const id = parseInt(req.params.id);// recupera el id puesto por parametro
    const buscarIndex = datos.modulos.findIndex((modulo) => modulo.idModulo === id);
    datos.modulos[buscarIndex] = {
        ...datos.modulos[buscarIndex],
        ...body,
    };
    escribir(datos);
    res.json({ message: "Modulo actualizado" });
});

//Cambiar estado del modulo
app.delete('/EstadoModulo/:id', (req, res) => {
    const datos = leerDatos();
    const id = parseInt(req.params.id);
    const modulo = datos.modulos.find((modulo) => modulo.idModulo === id);
    if (modulo) {
        let estado = modulo.estado;
        if (estado === "INACTIVO") {
            modulo.estado = "ACTIVO"
        }
        else {
            modulo.estado = "INACTIVO"
        }
        escribir(datos);
        res.json({ message: `El modulo ${modulo.nombre} cambio a ${modulo.estado}` });
    }
    else {
        res.status(500).send("Modulo no encontrado")
    }
});
//Asignar modulo a curso
app.post('/AsignarModulo/:moduloId/:cursoId', (req, res) => {
    const datos = leerDatos();
    const moduloId = parseInt(req.params.moduloId);
    const cursoId = parseInt(req.params.cursoId);
    //buscar curso
    const curso = datos.cursos.find((curso) => curso.idCurso === cursoId);
    if (!curso) { //en caso de no encontrar el curso, se muestra el siguiente mensaje
        return res.status(404).send("curso no encontrado.");
    }
    //buscar modulo
    const modulo = datos.modulos.find((modulo) => modulo.idModulo === moduloId);
    if (!modulo) {//en caso de no encontrar el modulo, se muestra el siguiente mensaje
        return res.status(404).send("Modulo no encontrado.");
    }
    //ver si el modulo ya esta en el curso
    const verificarModulo = datos.modulos.find((modulo) => modulo.idCurso === cursoId);
    if (verificarModulo) {
        return res.status(400).send(`El modulo ya esta en el curso de ${curso.nombre}`);
    }
    if (modulo) {
        modulo.idCurso = cursoId; //se le asigna el modulo al curso
    }
    //Actualizar la cantidad de modulos en el curso 
    curso.cantidadModulos += 1;

    escribir(datos);
    res.json({ message: `${modulo.nombre} añadida correctamente al curso ${curso.nombre}` });
});

//-------------------ALUMNOS-----------------------
//Listar todos los alumnos
app.get('/ListarAlumnos', (req, res) => {
    const datos = leerDatos();
    res.json(datos.alumnos)
});
//Buscar alumno por su DNI
app.get('/BuscarAlumno/:dni', (req, res) => {
    const datos = leerDatos();
    const dni = parseInt(req.params.dni) // recupera el dni puesto por parametro
    const alumno = datos.alumnos.find((alumno) => alumno.dni === dni);
    if (alumno) {
        res.json(alumno)
    } else {
        res.status(404).send("Alumno no encontrado.");
    }
});

//Actualizar alumno por su DNI
app.put('/ActualizarAlumno/:dni', (req, res) => {
    const datos = leerDatos();
    const body = req.body;
    const dni = parseInt(req.params.dni)
    const buscarIndex = datos.alumnos.findIndex((alumno) => alumno.dni === dni);
    if(buscarIndex){//en caso de no encontrar el alumno se muestra el siguiente mensaje
        return (res.status(404).send("Alumno no encontrado."))
    }
    datos.alumnos[buscarIndex] = {
        ...datos.alumnos[buscarIndex],
        ...body,
    };
    escribir(datos);
    res.json({ message: "Alumno/a Actualizado" })
});

//Cambiar estado del alumno
app.delete('/EstadoAlumno/:dni', (req, res) => {
    const datos = leerDatos();
    const dni = parseInt(req.params.dni)
    const alumno = datos.alumnos.find((alumno) => alumno.dni === dni);
    if (alumno) {
        let estado = alumno.estado;
        if (estado === "INACTIVO") {
            alumno.estado = "ACTIVO"
        }
        else {
            alumno.estado = "INACTIVO"
        }
        escribir(datos);
        res.json({ message: `El Alumno/a ${alumno.nombre} cambio a ${alumno.estado}` })
    }
    else {
        res.status(500).send("Alumno no encontrado")
    }
});
//Subir alumno 
app.post('/SubirAlumno', (req, res) => {
    const datos = leerDatos();
    let alumnos = datos.alumnos;
    const body = req.body;
    //Verifica que el dni no exista
    const dniExistente = alumnos.find(alumno => alumno.dni === body.dni);//compara los dni de los alumnos ya existentes con el nuevo dni que se quiere ingresar
    if (dniExistente) { //En caso que exista salta este mensaje
        return res.status(400).send({ message: "El DNI ya existe, no se puede crear el alumno." });
    }
    const nuevoAlumno = {
        ...body,
    };
    datos.alumnos.push(nuevoAlumno);
    escribir(datos);
    res.json(nuevoAlumno)
});

//Inscribir alumno en un curso
app.post('/InscribirAlumno/:alumnoDni/:cursoId', (req, res) => {
    const datos = leerDatos();
    const alumnoDni = parseInt(req.params.alumnoDni);
    const cursoId = parseInt(req.params.cursoId);

    //buscar el alumno y verificar si esta activo
    const alumno = datos.alumnos.find((alumno) => alumno.dni === alumnoDni);
    if (!alumno) {//en caso de no encontrar el alumno, salta este mensaje
        return res.status(404).send("Alumno no encontrado.");
    }
    const estado = alumno.estado; //Recupera el estado (ACTIVO/INACTIVO) del alumno. Para inscribir al alumno, tiene que estar activo
    if (estado === "INACTIVO") {//en caso de que este inactivo, salta este mensaje
        return res.status(404).send("Alumno INACTIVO.");
    }
    //Buscar el curso Y VERIFICA SI ESTA ACTIVO
    const curso = datos.cursos.find((curso) => curso.idCurso === cursoId);
    if (!curso) {
        return res.status(404).send("Curso no encontrado.");
    }
    const estadoCurso = curso.estado;
    if (estadoCurso === "INACTIVO") {
        return res.status(404).send("Curso INACTIVO.");
    }
    //ver si esta lleno el curso
    if (curso.cantidadAlumnos >= curso.cantidadTotalAlumnos) { //en caso de que el curso este lleno, salta este mensaje
        return res.status(400).send("No hay cupos disponibles en este curso.");
    }
    //ver si el alumno ya está inscrito en el curso
    const inscripcionVerificar = datos.inscripciones.find((inscripcion) => inscripcion.alumnoDni === alumnoDni && inscripcion.idCurso === cursoId);
    if (inscripcionVerificar) {
        return res.status(400).send("El alumno ya está inscrito en este curso.");
    }

    //Crear la nueva inscripción
    const nuevaInscripcion = {
        alumnoDni: alumnoDni, //guarda el dni del alumno
        idCurso: cursoId, //guarda el id del curso
        estadoInscripcion: "Completa",
        fechaInscripcion: new Date().toISOString().slice(0, 10), //obtenemos la fecha de inscripcion, se usa slice (0,10) para solo obtener la fecha
        pago: "Gratuito",
    };

    //Agregar la inscripción a los datos
    datos.inscripciones.push(nuevaInscripcion);

    //Actualizar la cantidad de alumnos inscritos en el curso y la cantidad de cursos inscripto al alumno
    curso.cantidadAlumnos += 1;
    alumno.cursoInscripto += 1;

    escribir(datos);
    res.json({ message: "Alumno inscrito correctamente:", inscripcion: nuevaInscripcion });
});

//---------------EVALUACIONES-----------------------
//Listar todas las evaluaciones
app.get('/ListarEvaluaciones', (req, res) => {
    const datos = leerDatos();
    res.json(datos.evaluaciones);
});

//Buscar evaluacion por ID
app.get('/BuscarEvaluacion/:id', (req, res) => {
    const datos = leerDatos();
    const id = parseInt(req.params.id);// recupera el id puesto por parametro
    const evaluacion = datos.evaluaciones.find((evaluacion) => evaluacion.idEvaluacion === id);
    if (evaluacion) {
        res.json(evaluacion);
    } else {
        res.status(404).send("Evaluacion no encontrado.");
    }
});

//Crear evaluacion
app.post('/SubirEvaluacion', (req, res) => {
    const datos = leerDatos();
    let evaluaciones = datos.evaluaciones;
    let nuevaEvaluacionId;
    if (evaluaciones.length > 0) {
        nuevaEvaluacionId = evaluaciones[evaluaciones.length - 1].idEvaluacion + 1;
    }
    else {
        nuevaEvaluacionId = 1;
    }
    const body = req.body;
    const nuevaEvaluacion = {
        idEvaluacion: nuevaEvaluacionId,
        ...body,
        idModulo: null,
    };
    datos.evaluaciones.push(nuevaEvaluacion);
    escribir(datos);
    res.json(nuevaEvaluacion);
});

//Actualizar evaluacion
app.put('/ActualizarEvaluacion/:id', (req, res) => {
    const datos = leerDatos();
    const body = req.body;
    const id = parseInt(req.params.id);// recupera el id puesto por parametro
    const buscarIndex = datos.evaluaciones.findIndex((evaluacion) => evaluacion.idEvaluacion === id);
    datos.evaluaciones[buscarIndex] = {
        ...datos.evaluaciones[buscarIndex],
        ...body,
    };
    escribir(datos);
    res.json({ message: "Evaluacion actualizada" });
});

//Cambiar estado de evaluacion
app.delete('/EstadoEvaluacion/:id', (req, res) => {
    const datos = leerDatos();
    const id = parseInt(req.params.id);
    const evaluacion = datos.evaluaciones.find((evaluacion) => evaluacion.idEvaluacion === id);
    if (evaluacion) {
        let estado = evaluacion.estado;
        if (estado === "INACTIVO") {
            evaluacion.estado = "ACTIVO"
        }
        else {
            evaluacion.estado = "INACTIVO"
        }
        escribir(datos);
        res.json({ message: `La evaluacion de ${evaluacion.tipo} cambio a ${evaluacion.estado}` });
    }
    else {
        res.status(500).send("Evaluacion no encontrada.");
    }
});

//Asignar evaluacion a modulo
app.post('/AsignarEvaluacion/:moduloId/:evaluacionId', (req, res) => {
    const datos = leerDatos();
    const moduloId = parseInt(req.params.moduloId);
    const evaluacionId = parseInt(req.params.evaluacionId);
    //buscar evaluacion
    const evaluacion = datos.evaluaciones.find((evaluacion) => evaluacion.idEvaluacion === evaluacionId);
    if (!evaluacion) {
        return res.status(404).send("Evaluacion no encontrada.");
    }
    //buscar modulo
    const modulo = datos.modulos.find((modulo) => modulo.idModulo === moduloId);
    if (!modulo) {
        return res.status(404).send("Modulo no encontrado.");
    }
    //ver si la evaluacion ya esta en el modulo
    const verificarEvaluacion = datos.evaluaciones.find(() => evaluacion.idModulo === moduloId);
    if (verificarEvaluacion) {
        return res.status(400).send(`La evaluacion ya esta en el modulo de ${modulo.nombre}`);
    }
    if (evaluacion) {
        evaluacion.idModulo = moduloId
    }
    //Actualizar la cantidad de evaluaciones en el modulo 
    modulo.cantidadEvaluaciones += 1;

    escribir(datos);
    res.json({ message: `${evaluacion.tipo} añadida correctamente al modulo ${modulo.nombre}` });
});

app.listen(port, () => {//Inicia el sv en el puerto (3000)
    console.log(`Servidor escuchando en http://localhost:${port}`);
});