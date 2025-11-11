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