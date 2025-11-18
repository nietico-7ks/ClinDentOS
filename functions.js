// ===================================
//   VARIABLES GLOBALES
// ===================================

// Array que almacena todas las citas agendadas
const citasAgendadas = [];

// Objeto que almacena los datos de la cita actual
const datosCita = { 
    servicio: '', // Tipo de servicio seleccionado
    fecha: '', // Fecha de la cita
    hora: '', // Hora de la cita
    nombre: '', // Nombre del paciente
    email: '', // Email del paciente
    telefono: '' // Teléfono del paciente
};

// Variable que controla el paso actual del formulario (1-5)
let pasoActual = 1;

// Array con los horarios disponibles para agendar citas
const horariosDisponibles = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', 
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

// ===================================
//   FUNCIONES PARA MODALES
// ===================================

// Abre el modal de agendamiento y configura el formulario
const abrirModal = () => { 
    document.getElementById('modalAgendamiento').style.display = 'block'; // Muestra el modal
    reiniciarFormulario(); // Reinicia los valores del formulario
    configurarFechaMinima(); // Configura la fecha mínima seleccionable
};

// Cierra el modal de agendamiento
const cerrarModal = () => document.getElementById('modalAgendamiento').style.display = 'none';

// Cierra el modal de confirmación
const cerrarConfirmacion = () => document.getElementById('modalConfirmacion').style.display = 'none';

// ===================================
//   CONFIGURACIÓN DE FECHA
// ===================================

// Configura la fecha mínima, máxima y genera horarios disponibles
function configurarFechaMinima() {
    // Obtiene la fecha de hoy
    const hoy = new Date();
    // Convierte la fecha a formato YYYY-MM-DD
    const fechaHoy = hoy.toISOString().split('T')[0];
    // Obtiene el elemento input de fecha
    const fechaInput = document.getElementById('fecha');
    // Establece la fecha actual como valor inicial
    fechaInput.value = fechaHoy;
    // La fecha mínima no puede ser anterior a hoy
    fechaInput.min = fechaHoy;
    // Almacena la fecha en el objeto datosCita
    datosCita.fecha = fechaHoy;
    // Calcula la fecha máxima (3 meses desde hoy)
    const fechaMaxima = new Date(hoy.setMonth(hoy.getMonth() + 3));
    // Establece la fecha máxima seleccionable
    fechaInput.max = fechaMaxima.toISOString().split('T')[0];
    // Genera los horarios disponibles para la fecha seleccionada
    generarHorarios();
}

// Evento que se dispara cuando cambia la fecha
document.getElementById('fecha').addEventListener('change', function() {
    // Actualiza la fecha en el objeto datosCita
    datosCita.fecha = this.value;
    // Regenera los horarios disponibles para la nueva fecha
    generarHorarios();
});

// ===================================
//   GENERACIÓN DE HORARIOS
// ===================================

// Genera los botones de horarios disponibles para la fecha seleccionada
function generarHorarios() {
    // Obtiene el contenedor donde se mostrarán los horarios
    const contenedor = document.getElementById('contenedorHoras');
    // Limpia el contenedor
    contenedor.innerHTML = '';
    // Filtra las horas ocupadas para la fecha seleccionada
    const horasOcupadas = citasAgendadas
        .filter(c => c.fecha === datosCita.fecha) // Filtra citas de la fecha actual
        .map(c => c.hora); // Extrae solo las horas
    
    // Itera sobre cada horario disponible
    horariosDisponibles.forEach(hora => {
        // Crea un botón para cada hora
        const boton = document.createElement('button');
        // Asigna clase según si la hora está ocupada o disponible
        boton.className = horasOcupadas.includes(hora) ? 'boton-hora ocupado' : 'boton-hora';
        // Establece el texto del botón con la hora
        boton.textContent = hora;
        // Almacena la hora en un atributo de datos
        boton.setAttribute('data-hora', hora);
        // Si la hora está ocupada, deshabilita el botón
        if (horasOcupadas.includes(hora)) {
            boton.disabled = true;
        } else {
            // Si está disponible, añade evento para seleccionar la hora
            boton.onclick = () => seleccionarHora(boton);
        }
        // Añade el botón al contenedor
        contenedor.appendChild(boton);
    });
}

// Marca una hora como seleccionada
function seleccionarHora(botonClicado) {
    // Elimina la clase seleccionado de todos los botones
    document.querySelectorAll('.boton-hora').forEach(b => b.classList.remove('seleccionado'));
    // Añade la clase seleccionado al botón clicado
    botonClicado.classList.add('seleccionado');
    // Almacena la hora seleccionada en datosCita
    datosCita.hora = botonClicado.getAttribute('data-hora');
}

// ===================================
//   NAVEGACIÓN ENTRE PASOS
// ===================================

// Muestra el paso especificado y oculta los demás
function mostrarPaso(numeroPaso) {
    // Oculta todas las secciones de pasos
    document.querySelectorAll('.seccion-paso').forEach(p => p.classList.remove('visible'));
    // Muestra solo la sección del paso actual
    document.getElementById('paso-' + numeroPaso).classList.add('visible');
    // Actualiza el indicador visual de pasos
    actualizarIndicador();
    // Actualiza el estado de los botones de navegación
    actualizarBotones();
}

// Actualiza el indicador visual del paso actual
function actualizarIndicador() {
    // Itera sobre cada indicador de paso (1-5)
    for (let i = 1; i <= 5; i++) {
        // Obtiene el elemento indicador
        const indicador = document.getElementById('indicador-' + i);
        // Marca como completado si el paso es menor al actual
        indicador.classList.toggle('completado', i < pasoActual);
        // Marca como activo si es el paso actual
        indicador.classList.toggle('activo', i === pasoActual);
    }
}

// Actualiza el estado de los botones siguiente y confirmar
function actualizarBotones() {
    // Deshabilita el botón anterior si estamos en el primer paso
    document.getElementById('botonAnterior').disabled = pasoActual === 1;
    // Oculta el botón siguiente si estamos en el último paso (5)
    document.getElementById('botonSiguiente').style.display = pasoActual === 5 ? 'none' : 'block';
    // Muestra el botón confirmar solo en el último paso
    document.getElementById('botonConfirmar').style.display = pasoActual === 5 ? 'block' : 'none';
}

// Avanza al siguiente paso si la validación es correcta
function irPasoSiguiente() {
    // Valida el paso actual
    if (validarPasoActual()) {
        // Avanza al siguiente paso
        pasoActual++;
        // Si es el paso 5 (resumen), genera el resumen de la cita
        if (pasoActual === 5) generarResumen();
        // Muestra el nuevo paso
        mostrarPaso(pasoActual);
    }
}

// Retrocede al paso anterior
const irPasoAnterior = () => { 
    pasoActual--; // Disminuye el paso actual
    mostrarPaso(pasoActual); // Muestra el paso anterior
};

// ===================================
//   VALIDACIÓN DE PASOS
// ===================================

// Valida el paso actual según su número
function validarPasoActual() {
    // Validación del paso 1 (selección de servicio)
    if (pasoActual === 1) {
        // Obtiene el servicio seleccionado
        const servicio = document.querySelector('input[name="servicio"]:checked');
        // Si no hay servicio seleccionado, muestra alerta
        if (!servicio) return mostrarAlerta('Por favor, selecciona un servicio'), false;
        // Almacena el servicio en datosCita
        datosCita.servicio = servicio.value;
    }
    
    // Validación del paso 2 (selección de fecha)
    if (pasoActual === 2) {
        // Obtiene la fecha seleccionada
        const fecha = document.getElementById('fecha').value;
        // Si no hay fecha seleccionada, muestra alerta
        if (!fecha) return mostrarAlerta('Por favor, selecciona una fecha'), false;
        // Almacena la fecha en datosCita
        datosCita.fecha = fecha;
    }
    
    // Validación del paso 3 (selección de hora)
    if (pasoActual === 3 && !datosCita.hora) 
        return mostrarAlerta('Por favor, selecciona una hora'), false;
    
    // Validación del paso 4 (datos personales)
    if (pasoActual === 4) {
        // Obtiene y limpia el nombre
        const nombre = document.getElementById('nombre').value.trim();
        // Obtiene y limpia el email
        const email = document.getElementById('email').value.trim();
        // Obtiene y limpia el teléfono
        const telefono = document.getElementById('telefono').value.trim();
        
        // Valida que el nombre no esté vacío
        if (!nombre) return mostrarAlerta('Por favor, ingresa tu nombre completo'), false;
        
        // Valida que el email sea válido usando expresión regular
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
            return mostrarAlerta('Por favor, ingresa un correo electrónico válido'), false;
        
        // Valida que el teléfono tenga al menos 7 dígitos
        if (!telefono || telefono.length < 7) 
            return mostrarAlerta('Por favor, ingresa un teléfono válido'), false;
        
        // Almacena los datos en datosCita
        datosCita.nombre = nombre;
        datosCita.email = email;
        datosCita.telefono = telefono;
    }
    
    // Si todas las validaciones pasaron
    return true;
}

// ===================================
//   GENERACIÓN DE RESUMEN
// ===================================

// Genera y muestra el resumen de la cita
function generarResumen() {
    // Formatea la fecha a formato legible en español
    const fechaFormateada = new Date(datosCita.fecha + 'T00:00:00')
        .toLocaleDateString('es-ES', { 
            weekday: 'long', // Día de la semana (ej: lunes)
            year: 'numeric', // Año (ej: 2025)
            month: 'long', // Mes completo (ej: enero)
            day: 'numeric' // Día del mes
        });
    
    // Array con las etiquetas del resumen
    const etiquetas = ['Servicio', 'Fecha', 'Hora', 'Nombre', 'Email', 'Teléfono'];
    
    // Array con los valores correspondientes
    const valores = [
        datosCita.servicio, 
        fechaFormateada, 
        datosCita.hora, 
        datosCita.nombre, 
        datosCita.email, 
        datosCita.telefono
    ];
    
    // Genera el HTML del resumen
    document.getElementById('contenedorResumen').innerHTML = 
        etiquetas
        .map((label, i) => 
            `<div class="item-resumen">
                <span class="etiqueta-resumen">${label}:</span>
                <span class="valor-resumen">${valores[i]}</span>
            </div>`
        )
        .join(''); // Concatena todos los elementos
}

// ===================================
//   CONFIRMACIÓN DE CITA
// ===================================

// Confirma la cita y la añade al array de citas agendadas
function confirmarCita() {
    // Verifica si ya existe una cita con la misma fecha y hora
    if (citasAgendadas.some(c => c.fecha === datosCita.fecha && c.hora === datosCita.hora)) {
        // Muestra error si la hora ya está reservada
        mostrarModalConfirmacion('error', '❌', 'Error', 
            'Lo sentimos, esa hora ya fue reservada. Por favor, selecciona otra hora.');
        // Vuelve al paso 3 (selección de hora)
        pasoActual = 3;
        mostrarPaso(pasoActual);
        // Regenera los horarios disponibles
        generarHorarios();
    } else {
        // Añade la cita al array de citas agendadas
        citasAgendadas.push({...datosCita}); // Usa spread operator para copiar el objeto
        
        // Formatea la fecha para mostrar en el mensaje
        const fechaFormateada = new Date(datosCita.fecha + 'T00:00:00')
            .toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        
        // Muestra mensaje de éxito
        mostrarModalConfirmacion('exito', '✓', '¡Cita Agendada con Éxito!', 
            `Hola ${datosCita.nombre}, tu cita para ${datosCita.servicio} el ${fechaFormateada} a las ${datosCita.hora} ha sido confirmada. Te enviaremos un recordatorio a ${datosCita.email}`);
        
        // Cierra el modal de agendamiento
        cerrarModal();
    }
}

// ===================================
//   MODALES DE CONFIRMACIÓN
// ===================================

// Muestra el modal de confirmación con un mensaje específico
function mostrarModalConfirmacion(tipo, icono, titulo, mensaje) {
    // Obtiene el modal de confirmación
    const modal = document.getElementById('modalConfirmacion');
    
    // Establece el icono (✓ o ❌)
    document.getElementById('iconoConfirmacion').textContent = icono;
    
    // Asigna la clase según el tipo (éxito o error)
    document.getElementById('iconoConfirmacion').className = 'icono-confirmacion ' + tipo;
    
    // Establece el título del modal
    document.getElementById('tituloConfirmacion').textContent = titulo;
    
    // Establece el mensaje del modal
    document.getElementById('mensajeConfirmacion').textContent = mensaje;
    
    // Muestra el modal
    modal.style.display = 'block';
}

// ===================================
//   ALERTAS
// ===================================

// Muestra una alerta temporal en la parte superior de la página
function mostrarAlerta(mensaje) {
    // Crea un nuevo elemento div para la alerta
    const alerta = document.createElement('div');
    // Asigna la clase de estilos
    alerta.className = 'alerta';
    // Establece el mensaje
    alerta.textContent = mensaje;
    // Añade la alerta al cuerpo de la página
    document.body.appendChild(alerta);
    // Elimina la alerta después de 3 segundos (3000 milisegundos)
    setTimeout(() => alerta.remove(), 3000);
}

// ===================================
//   REINICIAR FORMULARIO
// ===================================

// Reinicia todos los valores del formulario a sus valores iniciales
function reiniciarFormulario() {
    // Reinicia el paso actual al primero
    pasoActual = 1;
    // Muestra el primer paso
    mostrarPaso(pasoActual);
    
    // Limpia todos los valores del objeto datosCita
    Object.keys(datosCita).forEach(key => datosCita[key] = '');
    
    // Desmarca todos los radio buttons de servicio
    document.querySelectorAll('input[name="servicio"]').forEach(r => r.checked = false);
    
    // Limpia los campos de texto (nombre, email, teléfono)
    ['nombre', 'email', 'telefono'].forEach(id => document.getElementById(id).value = '');
}

// ===================================
//   FORMULARIOS DE REGISTRO/LOGIN
// ===================================

// Función genérica para validar formularios con callback
const validarFormulario = (formId, callback) => {
    // Obtiene el formulario por su ID
    document.getElementById(formId)?.addEventListener('submit', function(e) {
        e.preventDefault(); // Previene el envío por defecto del formulario
        callback(this); // Ejecuta la función callback con el formulario como parámetro
    });
};

// Validación del formulario de login
validarFormulario('formulario-login', (form) => {
    // Obtiene el email del formulario
    const email = form.querySelector('#email').value;
    // Obtiene la contraseña del formulario
    const password = form.querySelector('#password').value;
    
    // Valida que ambos campos estén completos
    if (!email || !password) return alert('Por favor completa todos los campos');
    
    // Valida que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');
    
    // Muestra mensaje de bienvenida
    alert('¡Bienvenido! ' + email);
});

// Validación del formulario de registro
validarFormulario('formulario-registro', (form) => {
    // Obtiene el nombre completo del formulario
    const nombre = form.querySelector('#nombre').value;
    // Obtiene el email del formulario
    const email = form.querySelector('#email').value;
    // Obtiene la primera contraseña
    const password = form.querySelector('#password').value;
    // Obtiene la confirmación de contraseña
    const password2 = form.querySelector('#password2').value;
    
    // Valida que todos los campos estén completos
    if (!nombre || !email || !password) return alert('Por favor completa todos los campos');
    
    // Valida que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');
    
    // Valida que ambas contraseñas coincidan
    if (password !== password2) return alert('Las contraseñas no coinciden');
    
    // Muestra mensaje de registro exitoso
    alert('¡Registro exitoso! Bienvenido ' + nombre);
});


//Lineas netas de codigo: 191