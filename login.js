document.getElementById('formulario-login').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validación simple
    if (email === '' || password === '') {
        alert('Por favor completa todos los campos');
        return;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    // Si todo es válido
    alert('¡Bienvenido! ' + email);
    // Aquí irías a enviar los datos a tu servidor
    // window.location.href = 'dashboard.html';
});