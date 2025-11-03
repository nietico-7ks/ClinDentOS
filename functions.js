document.addEventListener('DOMContentLoaded', () => {

    // --- Elementos del DOM ---
    const form = document.getElementById('appointmentForm');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const steps = document.querySelectorAll('.form-step');
    const datePicker = document.getElementById('datePicker');
    const timeSlotsContainer = document.getElementById('timeSlots');
    const summaryContent = document.getElementById('summaryContent');
    const modal = document.getElementById('confirmationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const closeModal = document.querySelector('.close-btn');

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

    // --- Constantes ---
    const STORAGE_KEY = 'dentalAppointments';
    const TIME_SLOTS = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    // --- Inicialización ---
    function init() {
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T')[0];
        datePicker.setAttribute('min', today);
        
        // Generar slots de tiempo por defecto (para la fecha de hoy)
        generateTimeSlots(today);
        
        // Event Listeners
        prevBtn.addEventListener('click', () => changeStep(-1));
        nextBtn.addEventListener('click', validateAndNext);
        form.addEventListener('submit', handleSubmit);
        datePicker.addEventListener('change', handleDateChange);
        closeModal.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }

    // --- Navegación entre Pasos ---
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        updateNavButtons();
    }

    function updateNavButtons() {
        prevBtn.disabled = currentStep === 0;
        
        if (currentStep === steps.length - 2) { // Penúltimo paso (resumen)
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
        if (currentStep === steps.length - 1) { // Último paso (resumen)
            generateSummary();
        }
    }

    // --- Validación y Recolección de Datos ---
    function validateAndNext() {
        let isValid = true;
        const currentStepElement = steps[currentStep];

        if (currentStep === 0) { // Servicio
            const selectedService = document.querySelector('input[name="service"]:checked');
            if (selectedService) {
                appointmentData.service = selectedService.value;
            } else {
                isValid = false;
                alert('Por favor, selecciona un servicio.');
            }
        } else if (currentStep === 1) { // Fecha
            if (datePicker.value) {
                appointmentData.date = datePicker.value;
            } else {
                isValid = false;
                alert('Por favor, selecciona una fecha.');
            }
        } else if (currentStep === 2) { // Hora
            const selectedTime = document.querySelector('.time-slot.selected');
            if (selectedTime && !selectedTime.classList.contains('disabled')) {
                appointmentData.time = selectedTime.dataset.time;
            } else {
                isValid = false;
                alert('Por favor, selecciona una hora disponible.');
            }
        } else if (currentStep === 3) { // Datos del usuario
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            if (name && email && phone) {
                appointmentData.name = name;
                appointmentData.email = email;
                appointmentData.phone = phone;
            } else {
                isValid = false;
                alert('Por favor, completa todos tus datos.');
            }
        }

        if (isValid) {
            changeStep(1);
        }
    }
    
    // --- Manejo de Fecha y Horas ---
    function handleDateChange(e) {
        const selectedDate = e.target.value;
        appointmentData.date = selectedDate;
        generateTimeSlots(selectedDate);
    }

    function generateTimeSlots(date) {
        timeSlotsContainer.innerHTML = '';
        const bookedAppointments = getAppointments();
        const bookedTimesForDate = bookedAppointments
            .filter(apt => apt.date === date)
            .map(apt => apt.time);

        TIME_SLOTS.forEach(time => {
            const slot = document.createElement('button');
            slot.type = 'button';
            slot.classList.add('time-slot');
            slot.dataset.time = time;
            slot.textContent = time;

            if (bookedTimesForDate.includes(time)) {
                slot.classList.add('disabled');
                slot.disabled = true;
            } else {
                slot.addEventListener('click', () => selectTimeSlot(slot));
            }
            timeSlotsContainer.appendChild(slot);
        });
    }

    function selectTimeSlot(slot) {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        appointmentData.time = slot.dataset.time;
    }

    // --- Resumen y Confirmación ---
    function generateSummary() {
        summaryContent.innerHTML = `
            <p><strong>Servicio:</strong> ${appointmentData.service}</p>
            <p><strong>Fecha:</strong> ${formatDate(appointmentData.date)}</p>
            <p><strong>Hora:</strong> ${appointmentData.time}</p>
            <p><strong>Nombre:</strong> ${appointmentData.name}</p>
            <p><strong>Email:</strong> ${appointmentData.email}</p>
            <p><strong>Teléfono:</strong> ${appointmentData.phone}</p>
        `;
    }
    
    function formatDate(dateString) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        // Verificación final de disponibilidad (por si acaso)
        const bookedAppointments = getAppointments();
        const isAlreadyBooked = bookedAppointments.some(apt => 
            apt.date === appointmentData.date && apt.time === appointmentData.time
        );

        if (isAlreadyBooked) {
            showModal('Error', 'Lo sentimos, esa hora ya fue agendada. Por favor, elige otra.');
            // Volver al paso de horas
            currentStep = 2;
            showStep(currentStep);
            generateTimeSlots(appointmentData.date);
            return;
        }

        saveAppointment(appointmentData);
        showModal('¡Cita Agendada con Éxito!', `Hola ${appointmentData.name}, tu cita para ${appointmentData.service} el ${formatDate(appointmentData.date)} a las ${appointmentData.time} ha sido confirmada. Te enviaremos un recordatorio a ${appointmentData.email}.`);
        
        // Resetear formulario
        form.reset();
        currentStep = 0;
        showStep(currentStep);
        Object.keys(appointmentData).forEach(key => appointmentData[key] = '');
        generateTimeSlots(new Date().toISOString().split('T')[0]);
    }

    // --- Manejo de localStorage (Simulación de Base de Datos) ---
    function getAppointments() {
        const appointments = localStorage.getItem(STORAGE_KEY);
        return appointments ? JSON.parse(appointments) : [];
    }

    function saveAppointment(appointment) {
        const appointments = getAppointments();
        appointments.push(appointment);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    }

    // --- Modal ---
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    // --- Lanzar la aplicación ---
    init();
});