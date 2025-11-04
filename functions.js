// ============================================
// SISTEMA DE AGENDAMIENTO DE CITAS DENTALES
// ============================================

// --- Base de Datos en Memoria (Simulación) ---
let appointmentsDB = [];

// --- Constantes ---
const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', 
    '16:00', '16:30', '17:00'
];

// --- Estado de la Aplicación ---
let currentStep = 0;
const appointmentData = {
    service: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: ''
};

// --- Elementos del DOM ---
let form, prevBtn, nextBtn, submitBtn, steps, progressSteps, progressLine;
let datePicker, timeSlotsContainer, summaryContent;
let appointmentModal, confirmationModal, modalTitle, modalMessage, modalIcon;

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    initializeDatePicker();
    
    // Efecto scroll para navbar
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});

function initializeElements() {
    form = document.getElementById('appointmentForm');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    submitBtn = document.getElementById('submitBtn');
    steps = document.querySelectorAll('.form-step');
    progressSteps = document.querySelectorAll('.progress-step');
    progressLine = document.getElementById('progressLine');
    datePicker = document.getElementById('datePicker');
    timeSlotsContainer = document.getElementById('timeSlots');
    summaryContent = document.getElementById('summaryContent');
    appointmentModal = document.getElementById('appointmentModal');
    confirmationModal = document.getElementById('confirmationModal');
    modalTitle = document.getElementById('modalTitle');
    modalMessage = document.getElementById('modalMessage');
    modalIcon = document.getElementById('modalIcon');
}

function setupEventListeners() {
    prevBtn.addEventListener('click', () => changeStep(-1));
    nextBtn.addEventListener('click', validateAndNext);
    form.addEventListener('submit', handleSubmit);
    datePicker.addEventListener('change', handleDateChange);
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === appointmentModal) {
            closeAppointment();
        }
        if (e.target === confirmationModal) {
            closeConfirmationModal();
        }
    });
}

function initializeDatePicker() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Establecer fecha mínima como hoy
    datePicker.setAttribute('min', todayStr);
    
    // Establecer fecha máxima (3 meses adelante)
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    datePicker.setAttribute('max', maxDate.toISOString().split('T')[0]);
    
    // Establecer fecha por defecto
    datePicker.value = todayStr;
    appointmentData.date = todayStr;
    
    // Generar slots iniciales
    generateTimeSlots(todayStr);
}

// ============================================
// NAVEGACIÓN ENTRE PÁGINAS
// ============================================

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offset = 80; // Altura del navbar
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// ============================================
// MODAL DE AGENDAMIENTO
// ============================================

function openAppointment() {
    appointmentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    resetForm();
}

function closeAppointment() {
    appointmentModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ============================================
// NAVEGACIÓN ENTRE PASOS DEL FORMULARIO
// ============================================

function showStep(stepIndex) {
    // Ocultar todos los pasos
    steps.forEach((step, index) => {
        step.classList.toggle('active', index === stepIndex);
    });
    
    updateProgressBar();
    updateNavButtons();
}

function updateProgressBar() {
    progressSteps.forEach((step, index) => {
        if (index < currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index === currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
    
    // Actualizar línea de progreso
    const progress = (currentStep / (progressSteps.length - 1)) * 100;
    progressLine.style.width = `${progress}%`;
}

function updateNavButtons() {
    prevBtn.disabled = currentStep === 0;
    
    if (currentStep === steps.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function changeStep(direction) {
    currentStep += direction;
    showStep(currentStep);
    
    if (currentStep === steps.length - 1) {
        generateSummary();
    }
}

// ============================================
// VALIDACIÓN Y RECOLECCIÓN DE DATOS
// ============================================

function validateAndNext() {
    let isValid = true;
    
    if (currentStep === 0) {
        // Validar servicio
        const selectedService = document.querySelector('input[name="service"]:checked');
        if (selectedService) {
            appointmentData.service = selectedService.value;
        } else {
            isValid = false;
            showAlert('Por favor, selecciona un servicio.', 'warning');
        }
    } 
    else if (currentStep === 1) {
        // Validar fecha
        if (datePicker.value) {
            appointmentData.date = datePicker.value;
        } else {
            isValid = false;
            showAlert('Por favor, selecciona una fecha.', 'warning');
        }
    } 
    else if (currentStep === 2) {
        // Validar hora
        const selectedTime = document.querySelector('.time-slot.selected');
        if (selectedTime && !selectedTime.classList.contains('disabled')) {
            appointmentData.time = selectedTime.dataset.time;
        } else {
            isValid = false;
            showAlert('Por favor, selecciona una hora disponible.', 'warning');
        }
    } 
    else if (currentStep === 3) {
        // Validar datos del usuario
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!name) {
            isValid = false;
            showAlert('Por favor, ingresa tu nombre completo.', 'warning');
        } else if (!email || !isValidEmail(email)) {
            isValid = false;
            showAlert('Por favor, ingresa un correo electrónico válido.', 'warning');
        } else if (!phone || phone.length < 7) {
            isValid = false;
            showAlert('Por favor, ingresa un número de teléfono válido.', 'warning');
        } else {
            appointmentData.name = name;
            appointmentData.email = email;
            appointmentData.phone = phone;
        }
    }
    
    if (isValid) {
        changeStep(1);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// MANEJO DE FECHA Y HORAS
// ============================================

function handleDateChange(e) {
    const selectedDate = e.target.value;
    appointmentData.date = selectedDate;
    generateTimeSlots(selectedDate);
}

function generateTimeSlots(date) {
    timeSlotsContainer.innerHTML = '';
    
    const bookedTimes = appointmentsDB
        .filter(apt => apt.date === date)
        .map(apt => apt.time);
    
    TIME_SLOTS.forEach(time => {
        const slot = document.createElement('button');
        slot.type = 'button';
        slot.classList.add('time-slot');
        slot.dataset.time = time;
        slot.textContent = time;
        
        if (bookedTimes.includes(time)) {
            slot.classList.add('disabled');
            slot.disabled = true;
        } else {
            slot.addEventListener('click', () => selectTimeSlot(slot));
        }
        
        timeSlotsContainer.appendChild(slot);
    });
}

function selectTimeSlot(slot) {
    // Remover selección previa
    document.querySelectorAll('.time-slot').forEach(s => {
        s.classList.remove('selected');
    });
    
    // Seleccionar nueva hora
    slot.classList.add('selected');
    appointmentData.time = slot.dataset.time;
}

// ============================================
// RESUMEN Y CONFIRMACIÓN
// ============================================

function generateSummary() {
    summaryContent.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Servicio:</span>
            <span class="summary-value">${appointmentData.service}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Fecha:</span>
            <span class="summary-value">${formatDate(appointmentData.date)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Hora:</span>
            <span class="summary-value">${appointmentData.time}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Nombre:</span>
            <span class="summary-value">${appointmentData.name}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Email:</span>
            <span class="summary-value">${appointmentData.email}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Teléfono:</span>
            <span class="summary-value">${appointmentData.phone}</span>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', options);
}

// ============================================
// ENVÍO DEL FORMULARIO
// ============================================

function handleSubmit(e) {
    e.preventDefault();
    
    // Verificación final de disponibilidad
    const isAlreadyBooked = appointmentsDB.some(apt => 
        apt.date === appointmentData.date && apt.time === appointmentData.time
    );
    
    if (isAlreadyBooked) {
        showConfirmationModal(
            'error',
            '❌',
            'Error',
            'Lo sentimos, esa hora ya fue agendada por otro paciente. Por favor, elige otra hora disponible.'
        );
        // Volver al paso de selección de hora
        currentStep = 2;
        showStep(currentStep);
        generateTimeSlots(appointmentData.date);
        return;
    }
    
    // Guardar cita
    saveAppointment({...appointmentData});
    
    // Mostrar confirmación
    showConfirmationModal(
        'success',
        '✓',
        '¡Cita Agendada con Éxito!',
        `Hola ${appointmentData.name}, tu cita para ${appointmentData.service} el ${formatDate(appointmentData.date)} a las ${appointmentData.time} ha sido confirmada. Te enviaremos un recordatorio a ${appointmentData.email}.`
    );
    
    // Cerrar modal de agendamiento
    closeAppointment();
    
    // Resetear formulario
    resetForm();
}

// ============================================
// MANEJO DE BASE DE DATOS
// ============================================

function saveAppointment(appointment) {
    appointmentsDB.push(appointment);
    console.log('Cita guardada:', appointment);
    console.log('Total de citas:', appointmentsDB.length);
}

// ============================================
// MODALES Y ALERTAS
// ============================================

function showConfirmationModal(type, icon, title, message) {
    modalIcon.textContent = icon;
    modalIcon.className = `modal-icon ${type}`;
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeConfirmationModal() {
    confirmationModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showAlert(message, type = 'info') {
    // Crear alerta personalizada
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'warning' ? '#F39C12' : '#3498db'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideDown 0.3s ease-out;
        font-weight: 600;
        max-width: 90%;
        text-align: center;
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// ============================================
// RESETEO DEL FORMULARIO
// ============================================

function resetForm() {
    form.reset();
    currentStep = 0;
    showStep(currentStep);
    
    // Limpiar datos
    Object.keys(appointmentData).forEach(key => {
        appointmentData[key] = '';
    });
    
    // Resetear fecha a hoy
    const today = new Date().toISOString().split('T')[0];
    datePicker.value = today;
    appointmentData.date = today;
    
    // Regenerar slots de tiempo
    generateTimeSlots(today);
    
    // Limpiar selecciones
    document.querySelectorAll('input[name="service"]').forEach(input => {
        input.checked = false;
    });
    
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
}

// ============================================
// ANIMACIONES CSS ADICIONALES
// ============================================

// Agregar estilos de animación para alertas
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// ============================================
// FUNCIONES GLOBALES (llamadas desde HTML)
// ============================================

window.openAppointment = openAppointment;
window.closeAppointment = closeAppointment;
window.closeConfirmationModal = closeConfirmationModal;
window.scrollToSection = scrollToSection;