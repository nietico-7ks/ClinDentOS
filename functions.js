// ===================================
// VARIABLES GLOBALES
// ===================================

// Almacena todas las citas que se han agendado
var citasAgendadas = [];

// Almacena los datos de la cita que se está creando
var datosCita = {
    servicio: '',
    fecha: '',
    hora: '',
    nombre: '',
    email: '',
    telefono: ''
};

// Número del paso actual (empieza en 1)
var pasoActual = 1;

// Lista de todos los horarios disponibles en el consultorio
var horariosDisponibles = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
];

// ===================================
// FUNCIONES PARA ABRIR/CERRAR MODALES
// ===================================

// Función para abrir el modal de agendamiento
function abrirModal() {
    document.getElementById('modalAgendamiento').style.display = 'block';
    reiniciarFormulario();
    configurarFechaMinima();
}

// Función para cerrar el modal de agendamiento
function cerrarModal() {
    document.getElementById('modalAgendamiento').style.display = 'none';
}

// Función para cerrar el modal de confirmación
function cerrarConfirmacion() {
    document.getElementById('modalConfirmacion').style.display = 'none';
}

// ===================================
// CONFIGURACIÓN DE LA FECHA
// ===================================

// Configurar la fecha mínima como hoy y la máxima como 3 meses después
function configurarFechaMinima() {
    // Obtener la fecha de hoy
    var hoy = new Date();
    var año = hoy.getFullYear();
    var mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    var dia = hoy.getDate().toString().padStart(2, '0');
    var fechaHoy = año + '-' + mes + '-' + dia;
    
    // Establecer la fecha de hoy en el input
    document.getElementById('fecha').value = fechaHoy;
    document.getElementById('fecha').min = fechaHoy;
    datosCita.fecha = fechaHoy;
    
    // Calcular fecha máxima (3 meses después)
    var fechaMaxima = new Date();
    fechaMaxima.setMonth(fechaMaxima.getMonth() + 3);
    var añoMax = fechaMaxima.getFullYear();
    var mesMax = (fechaMaxima.getMonth() + 1).toString().padStart(2, '0');
    var diaMax = fechaMaxima.getDate().toString().padStart(2, '0');
    document.getElementById('fecha').max = añoMax + '-' + mesMax + '-' + diaMax;
    
    // Generar los horarios disponibles para hoy
    generarHorarios();
}

// Cuando el usuario cambia la fecha, actualizar los horarios
document.getElementById('fecha').addEventListener('change', function() {
    datosCita.fecha = this.value;
    generarHorarios();
});

// ===================================
// GENERAR HORARIOS DISPONIBLES
// ===================================

function generarHorarios() {
    var contenedor = document.getElementById('contenedorHoras');
    contenedor.innerHTML = ''; // Limpiar los horarios anteriores
    
    // Buscar qué horas ya están ocupadas en esta fecha
    var horasOcupadas = [];
    for (var i = 0; i < citasAgendadas.length; i++) {
        if (citasAgendadas[i].fecha === datosCita.fecha) {
            horasOcupadas.push(citasAgendadas[i].hora);
        }
    }
    
    // Crear un botón para cada horario disponible
    for (var j = 0; j < horariosDisponibles.length; j++) {
        var hora = horariosDisponibles[j];
        var boton = document.createElement('button');
        boton.className = 'boton-hora';
        boton.textContent = hora;
        boton.setAttribute('data-hora', hora);
        
        // Verificar si esta hora está ocupada
        var estaOcupada = false;
        for (var k = 0; k < horasOcupadas.length; k++) {
            if (horasOcupadas[k] === hora) {
                estaOcupada = true;
                break;
            }
        }
        
        if (estaOcupada) {
            // Marcar como ocupado
            boton.className = 'boton-hora ocupado';
            boton.disabled = true;
        } else {
            // Agregar evento de clic
            boton.onclick = function() {
                seleccionarHora(this);
            };
        }
        
        contenedor.appendChild(boton);
    }
}

// Función para seleccionar una hora específica
function seleccionarHora(botonClicado) {
    // Quitar la selección de todos los botones
    var todosLosBotones = document.getElementsByClassName('boton-hora');
    for (var i = 0; i < todosLosBotones.length; i++) {
        todosLosBotones[i].classList.remove('seleccionado');
    }
    
    // Marcar el botón clicado como seleccionado
    botonClicado.classList.add('seleccionado');
    datosCita.hora = botonClicado.getAttribute('data-hora');
}

// ===================================
// NAVEGACIÓN ENTRE PASOS
// ===================================

// Función para mostrar un paso específico
function mostrarPaso(numeroPaso) {
    // Ocultar todos los pasos
    var pasos = document.getElementsByClassName('seccion-paso');
    for (var i = 0; i < pasos.length; i++) {
        pasos[i].classList.remove('visible');
    }
    
    // Mostrar el paso actual
    document.getElementById('paso-' + numeroPaso).classList.add('visible');
    
    // Actualizar el indicador de progreso
    actualizarIndicador();
    
    // Actualizar los botones de navegación
    actualizarBotones();
}

// Función para actualizar el indicador de progreso
function actualizarIndicador() {
    for (var i = 1; i <= 5; i++) {
        var indicador = document.getElementById('indicador-' + i);
        
        if (i < pasoActual) {
            // Pasos completados
            indicador.classList.add('completado');
            indicador.classList.remove('activo');
        } else if (i === pasoActual) {
            // Paso actual
            indicador.classList.add('activo');
            indicador.classList.remove('completado');
        } else {
            // Pasos futuros
            indicador.classList.remove('activo');
            indicador.classList.remove('completado');
        }
    }
}

// Función para actualizar los botones de navegación
function actualizarBotones() {
    var botonAnterior = document.getElementById('botonAnterior');
    var botonSiguiente = document.getElementById('botonSiguiente');
    var botonConfirmar = document.getElementById('botonConfirmar');
    
    // Deshabilitar el botón "Anterior" en el primer paso
    if (pasoActual === 1) {
        botonAnterior.disabled = true;
    } else {
        botonAnterior.disabled = false;
    }
    
    // En el último paso, mostrar el botón "Confirmar" en lugar de "Siguiente"
    if (pasoActual === 5) {
        botonSiguiente.style.display = 'none';
        botonConfirmar.style.display = 'block';
    } else {
        botonSiguiente.style.display = 'block';
        botonConfirmar.style.display = 'none';
    }
}

// Función para ir al siguiente paso
function irPasoSiguiente() {
    // Validar el paso actual antes de avanzar
    if (validarPasoActual()) {
        pasoActual = pasoActual + 1;
        
        // Si llegamos al paso 5, generar el resumen
        if (pasoActual === 5) {
            generarResumen();
        }
        
        mostrarPaso(pasoActual);
    }
}

// Función para ir al paso anterior
function irPasoAnterior() {
    pasoActual = pasoActual - 1;
    mostrarPaso(pasoActual);
}

// ===================================
// VALIDACIÓN DE CADA PASO
// ===================================

function validarPasoActual() {
    if (pasoActual === 1) {
        // Validar que se haya seleccionado un servicio
        var servicioSeleccionado = document.querySelector('input[name="servicio"]:checked');
        if (servicioSeleccionado) {
            datosCita.servicio = servicioSeleccionado.value;
            return true;
        } else {
            mostrarAlerta('Por favor, selecciona un servicio');
            return false;
        }
    }
    
    if (pasoActual === 2) {
        // Validar que se haya seleccionado una fecha
        var fecha = document.getElementById('fecha').value;
        if (fecha) {
            datosCita.fecha = fecha;
            return true;
        } else {
            mostrarAlerta('Por favor, selecciona una fecha');
            return false;
        }
    }
    
    if (pasoActual === 3) {
        // Validar que se haya seleccionado una hora
        if (datosCita.hora) {
            return true;
        } else {
            mostrarAlerta('Por favor, selecciona una hora');
            return false;
        }
    }
    
    if (pasoActual === 4) {
        // Validar los datos del paciente
        var nombre = document.getElementById('nombre').value.trim();
        var email = document.getElementById('email').value.trim();
        var telefono = document.getElementById('telefono').value.trim();
        
        if (!nombre) {
            mostrarAlerta('Por favor, ingresa tu nombre completo');
            return false;
        }
        
        if (!email || !validarEmail(email)) {
            mostrarAlerta('Por favor, ingresa un correo electrónico válido');
            return false;
        }
        
        if (!telefono || telefono.length < 7) {
            mostrarAlerta('Por favor, ingresa un teléfono válido');
            return false;
        }
        
        datosCita.nombre = nombre;
        datosCita.email = email;
        datosCita.telefono = telefono;
        return true;
    }
    
    return true;
}

// Función para validar el formato del email
function validarEmail(email) {
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ===================================
// GENERAR RESUMEN
// ===================================

function generarResumen() {
    var contenedor = document.getElementById('contenedorResumen');
    
    // Formatear la fecha para mostrarla más bonita
    var fechaFormateada = formatearFecha(datosCita.fecha);
    
    // Crear el HTML del resumen
    contenedor.innerHTML = 
        '<div class="item-resumen">' +
            '<span class="etiqueta-resumen">Servicio:</span>' +
            '<span class="valor-resumen">' + datosCita.servicio + '</span>' +
        '</div>' +
        '<div class="item-resumen">' +
            '<span class="etiqueta-resumen">Fecha:</span>' +
            '<span class="valor-resumen">' + fechaFormateada + '</span>' +
        '</div>' +
        '<div class="item-resumen">' +
            '<span class="etiqueta-resumen">Hora:</span>' +
            '<span class="valor-resumen">' + datosCita.hora + '</span>' +
        '</div>' +
        '<div class="item-resumen">' +
            '<span class="etiqueta-resumen">Nombre:</span>' +
            '<span class="valor-resumen">' + datosCita.nombre + '</span>' +
        '</div>' +
        '<div class="item-resumen">' +
            '<span class="etiqueta-resumen">Email:</span>' +
            '<span class="valor-resumen">' + datosCita.email + '</span>' +
        '</div>' +
        '<div class="item-resumen">' +
            '<span class="etiqueta-resumen">Teléfono:</span>' +
            '<span class="valor-resumen">' + datosCita.telefono + '</span>' +
        '</div>';
}

// Función para formatear la fecha de forma legible
function formatearFecha(fechaStr) {
    var fecha = new Date(fechaStr + 'T00:00:00');
    var opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return fecha.toLocaleDateString('es-ES', opciones);
}

// ===================================
// CONFIRMAR CITA
// ===================================

function confirmarCita() {
    // Verificar que la hora no haya sido reservada por otro usuario
    var yaReservada = false;
    for (var i = 0; i < citasAgendadas.length; i++) {
        if (citasAgendadas[i].fecha === datosCita.fecha && 
            citasAgendadas[i].hora === datosCita.hora) {
            yaReservada = true;
            break;
        }
    }
    
    if (yaReservada) {
        // Mostrar error
        mostrarModalConfirmacion(
            'error',
            '❌',
            'Error',
            'Lo sentimos, esa hora ya fue reservada. Por favor, selecciona otra hora.'
        );
        // Regresar al paso 3 para elegir otra hora
        pasoActual = 3;
        mostrarPaso(pasoActual);
        generarHorarios();
    } else {
        // Guardar la cita
        var nuevaCita = {
            servicio: datosCita.servicio,
            fecha: datosCita.fecha,
            hora: datosCita.hora,
            nombre: datosCita.nombre,
            email: datosCita.email,
            telefono: datosCita.telefono
        };
        citasAgendadas.push(nuevaCita);
        
        // Mostrar confirmación exitosa
        var mensaje = 'Hola ' + datosCita.nombre + ', tu cita para ' + 
                     datosCita.servicio + ' el ' + formatearFecha(datosCita.fecha) + 
                     ' a las ' + datosCita.hora + ' ha sido confirmada. ' +
                     'Te enviaremos un recordatorio a ' + datosCita.email;
        
        mostrarModalConfirmacion(
            'exito',
            '✓',
            '¡Cita Agendada con Éxito!',
            mensaje
        );
        
        // Cerrar el modal de agendamiento
        cerrarModal();
    }
}

// ===================================
// MOSTRAR MODAL DE CONFIRMACIÓN
// ===================================

function mostrarModalConfirmacion(tipo, icono, titulo, mensaje) {
    var modal = document.getElementById('modalConfirmacion');
    var iconoElemento = document.getElementById('iconoConfirmacion');
    var tituloElemento = document.getElementById('tituloConfirmacion');
    var mensajeElemento = document.getElementById('mensajeConfirmacion');
    
    iconoElemento.textContent = icono;
    iconoElemento.className = 'icono-confirmacion ' + tipo;
    tituloElemento.textContent = titulo;
    mensajeElemento.textContent = mensaje;
    
    modal.style.display = 'block';
}

// ===================================
// MOSTRAR ALERTAS TEMPORALES
// ===================================

function mostrarAlerta(mensaje) {
    // Crear el elemento de alerta
    var alerta = document.createElement('div');
    alerta.className = 'alerta';
    alerta.textContent = mensaje;
    
    // Agregar al body
    document.body.appendChild(alerta);
    
    // Eliminar después de 3 segundos
    setTimeout(function() {
        alerta.remove();
    }, 3000);
}

// ===================================
// REINICIAR FORMULARIO
// ===================================

function reiniciarFormulario() {
    // Volver al paso 1
    pasoActual = 1;
    mostrarPaso(pasoActual);
    
    // Limpiar todos los datos
    datosCita.servicio = '';
    datosCita.fecha = '';
    datosCita.hora = '';
    datosCita.nombre = '';
    datosCita.email = '';
    datosCita.telefono = '';
    
    // Limpiar los campos del formulario
    var radios = document.querySelectorAll('input[name="servicio"]');
    for (var i = 0; i < radios.length; i++) {
        radios[i].checked = false;
    }
    
    document.getElementById('nombre').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefono').value = '';
}

document.getElementById('formulario-registro').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    
    if (nombre === '' || email === '' || password === '') {
        alert('Por favor completa todos los campos');
        return;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    if (password !== password2) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    alert('¡Registro exitoso! Bienvenido ' + nombre);
    // window.location.href = 'login.html';
});