let pagina = 1;

const cita ={
    nombre: '',
    fecha: '',
    hora: '',
    servicios: [],
}

document.addEventListener('DOMContentLoaded', function(){
    iniciaApp();
})

function iniciaApp(){
    //mostrar los servicios desde el JSON
    mostrarServicios();

    //resalta el div actual segun el tab seleccionado
    mostrarSeccion();

    //oculta o muestra una seccion segun el tab seleccionado
    cambiarSeccion();

    //paginacion siguiente y anterior
    paginaSiguiente();

    paginaAnterior();

    //comprueba la pagina actual para ocultar o mostrar paginacion
    botonesPaginacion();

    //validacion de resumen de cita
    mostrarResumen();

    //almacenar el nombre de la cita
    nombreCita();

    //almacena la fecha de la cita
    fechaCita();

    //deshabilitar fecha anterior
    deshabilitarFechas()

    //almacena la hora de la cita
    horaCita();
}

function mostrarSeccion(){

    //eliminar mostrar-seccion de la seccion anterior 
    const seccionAnterior = document.querySelector('.mostrar-seccion');
    if(seccionAnterior){
        seccionAnterior.classList.remove('mostrar-seccion');
    }
    
    const seccionActual = document.querySelector(`#paso-${pagina}`);
    seccionActual.classList.add('mostrar-seccion');

    //eliminar clase de actual del tab anterior
    const tabAnterior = document.querySelector('.tabs button.actual');
    if(tabAnterior){
        tabAnterior.classList.remove('actual')
    }

    //resaltar en azul el tab actual 
    const tab = document.querySelector(`[data-paso="${pagina}"]`);
    tab.classList.add('actual');
}

function cambiarSeccion(){
    const enlaces = document.querySelectorAll('.tabs button');

    //foreach para poner addeventlistener en c/u de los botones 
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', e =>{
            e.preventDefault();
            pagina = parseInt(e.target.dataset.paso);

            // //agrega mostrar-seccion donde dimos click
            // const seccion = document.querySelector(`#paso-${pagina}`);
            // seccion.classList.add('mostrar-seccion');

            // //agregar clase de actual del tab anterior
            // const tab = document.querySelector(`[data-paso="${pagina}"]`);
            // tab.classList.add('actual');

            //llamar la funcion de mostrar seccion
            mostrarSeccion();

            botonesPaginacion();
        })
    })
}

async function mostrarServicios(){
    try {
        const resultado = await fetch('./servicios.json');//es como ajax
        const db = await resultado.json();//especificamos que tipó de informacion es

        const {servicios} = db;

        //generar el HTML
        servicios.forEach(servicio => {
            //extrae los valores del arreglo de servicio
            const {id, nombre, precio} = servicio;

            //DOM scripting
            //Generando nombre servicio
            const nombreServicio = document.createElement('P');
            nombreServicio.textContent = nombre;
            nombreServicio.classList.add('nombre-servicio');

            //Generando precio servicio
            const precioServicio = document.createElement('P');
            precioServicio.textContent = `$ ${precio}`;
            precioServicio.classList.add('precio-servicio');

            //generando DIV contenedor
            const servicioDiv = document.createElement('DIV');
            servicioDiv.classList.add('servicio');
            servicioDiv.dataset.idServicio = id;
            
            //injectar precio y nombre en el DIV de servicios
            servicioDiv.appendChild(nombreServicio);
            servicioDiv.appendChild(precioServicio);

            //injectar los DIV's en HTML
            document.querySelector('#servicios').appendChild(servicioDiv);
 
            //seleccion de servicios para la cita
            servicioDiv.onclick = seleccionarServicio;
        });
    } catch (error) {
        console.log(error);
    }
}


function seleccionarServicio(e){  
    //forzar que el elemento  al que le demos click sea el div
    let elemento;
    if(e.target.tagName === 'P'){
        elemento = e.target.parentElement;
    }else{
        elemento = e.target;
    }

    //agregar y quitar clase de CSS seleccionado
    if(elemento.classList.contains('seleccionado')){
        elemento.classList.remove('seleccionado');

        const id = parseInt(elemento.dataset.idServicio);

        eliminarServicio(id);
    }
    else{
        elemento.classList.add('seleccionado');
        //console.log( elemento.firstElementChild.nextElementSibling.textContent);
        const servicioObj = {
            id: parseInt(elemento.dataset.idServicio), 
            nombre: elemento.firstElementChild.textContent,
            precio: elemento.firstElementChild.nextElementSibling.textContent,
        }
        //console.log(servicioObj);
        agregarServicio(servicioObj);
    }
}

function eliminarServicio(id){
    const { servicios } = cita;
    cita.servicios = servicios.filter( servicio => servicio.id !== id)
    console.log(cita);
}

function agregarServicio(servicioObj){
    //extraemos los servicios del arreglo global "citas"
    const {servicios} = cita;
    //agregamos los nuevos servicios al arreglo existente
    cita.servicios = [...servicios, servicioObj];
    console.log(cita);
}

function paginaSiguiente(){
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', () =>{
        pagina++;
        //console.log(pagina);
        botonesPaginacion();
    })
}

function paginaAnterior(){
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', () =>{
        pagina--;
        //console.log(pagina);
        botonesPaginacion();
    })
}

function botonesPaginacion(){
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if(pagina === 1){
        paginaAnterior.classList.add('ocultar');
    }
    else if(pagina === 3){
        paginaSiguiente.classList.add('ocultar');
        paginaAnterior.classList.remove('ocultar');

        mostrarResumen();//estamos en la pagina 3, carga el resumen de la cita
    }
    else{
        paginaSiguiente.classList.remove('ocultar');
        paginaAnterior.classList.remove('ocultar');
    }
    mostrarSeccion(); //muestra el nuevo contenido
}

function mostrarResumen(){
    //destructuring
    const{nombre, fecha, hora, servicios} = cita;

    //seleccionar el resumen
    const resumenDiv = document.querySelector('.contenido-resumen');

    //limpia el html previo
    while(resumenDiv.firstChild){
        resumenDiv.removeChild(resumenDiv.firstChild);
    }

    //validacion de objeto
    if(Object.values(cita).includes('')){
        const noServicios = document.createElement('P');
        noServicios.textContent = 'Faltan datos para reservar la cita, verifique la información'
        noServicios.classList.add('invalidar-cita');

        //agregar a resumenDiv
        resumenDiv.appendChild(noServicios);
        return;
    }


    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';

    //mostrar el resumen
    const nombreCita = document.createElement('P');
    nombreCita.innerHTML = `<span>Nombre: </span>${nombre}`

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha: </span>${fecha}`

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora: </span>${hora}`

    const serviciosCita = document.createElement('DIV');
    serviciosCita.classList.add('resumen-servicios');

    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';

    serviciosCita.appendChild(headingServicios);

    let cantidad = 0;
    
    //iterar sobre el arreglo de servicios
    servicios.forEach(servicio =>{

        const {nombre, precio} = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.textContent = precio;
        precioServicio.classList.add('precio');
        
        //sacando precios 
        const totalServicio = precio.split('$');
        cantidad += parseInt(totalServicio[1].trim());

        //colocar txt y precio en div
        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        serviciosCita.appendChild(contenedorServicio);
    })

    //agregamos elementos al DIV
    resumenDiv.appendChild(headingCita);
    resumenDiv.appendChild(nombreCita);
    resumenDiv.appendChild(fechaCita);
    resumenDiv.appendChild(horaCita);

    resumenDiv.appendChild(serviciosCita);

    const cantidadPagar = document.createElement('P');
    cantidadPagar.classList.add('total');
    cantidadPagar.innerHTML = `<span>Total a pagar: </span>$ ${cantidad}`;
    resumenDiv.appendChild(cantidadPagar);
}


function nombreCita(){
    const nombreinput = document.querySelector('#nombre');

    nombreinput.addEventListener('input', (e) => {
        const nombreTexto = e.target.value.trim();
        
        //validacion de espacio en blanco
        if(nombreTexto === '' || nombreTexto.length < 3){
            mostrarAlerta('nombre no valido', 'error');
        }
        else{
            const alerta = document.querySelector('.alerta')
            if(alerta){
                alerta.remove();
            }
            cita.nombre = nombreTexto;
        }
    })
}

function mostrarAlerta(mensaje, tipo){
    //si ya hay una alerta la sustituimos
    const alertaPrevia = document.querySelector('.alerta')
    if(alertaPrevia){
        return;
    }

    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');

    if(tipo === 'error'){
        alerta.classList.add('error');
    }
    
    //insertar en HTML
    const formulario = document.querySelector('.formulario')
    formulario.appendChild(alerta);

    //eliminar la alerta despues de 2 segs
    setTimeout(() => {
        alerta.remove();
    }, 2000);
}

function fechaCita(){
    const fechaInput = document.querySelector('#fecha');
    fechaInput.addEventListener('input', (e) =>{
        const dia = new Date(e.target.value).getUTCDay();
        if([0, 6].includes(dia)){
            e.preventDefault();
            fechaInput.value = '';
            mostrarAlerta('Fines de semana no permitidos', 'error');
        }
        else{
            cita.fecha = fechaInput.value;
        }
        //codigo para sacar el dia de la fecha
        // const opciones = {
        //     weekday: 'long',
        // }
        // console.log(dia.toLocaleDateString('es-ES', opciones));
    })
}

function deshabilitarFechas(){
    const fechaInput = document.querySelector('#fecha');

    const fechaHoy = new Date();
    const year = fechaHoy.getFullYear();
    const mes = fechaHoy.getMonth() +1;
    const dia = fechaHoy.getDate() +1;

    //formato deseado: YYYY-MM-DD
    const fechaDeshabilitar = `${year}-${mes < 10 ? `0${mes}` : mes}-${dia < 10 ? `0${dia}` : dia}`
    //console.log(fechaDeshabilitar);
    fechaInput.min = fechaDeshabilitar;
}

function horaCita(){
    const horaInput = document.querySelector('#hora'); 
    horaInput.addEventListener('input', e =>{

        const horaCita = e.target.value
        const hora = horaCita.split(':')

        if(hora[0] <10 || hora[0] > 18){
            mostrarAlerta('hora no valida', 'error');
            setTimeout(() => {
                horaInput.value = '';
            }, 2000);
            
        }else{
            cita.hora = horaCita;
        }
    })
}