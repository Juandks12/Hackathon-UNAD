// Manejo del formulario de login
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Deshabilitar botón y mostrar loading
      submitBtn.disabled = true;
      submitBtn.textContent = 'Iniciando sesión...';
      
      try {
        const result = await AuthAPI.login(username, password);
        
        // Redirigir según el rol
        if (result.role === 'admin') {
          window.location.href = '/admin-dashboard.html';
        } else {
          window.location.href = '/employee-dashboard.html';
        }
      } catch (error) {
        // Mostrar error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
        errorDiv.innerHTML = `
          ${error.message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Remover errores anteriores
        const existingError = document.querySelector('.alert-danger');
        if (existingError) {
          existingError.remove();
        }
        
        loginForm.appendChild(errorDiv);
        
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
  
  // Si ya está autenticado, redirigir
  const token = TokenManager.getToken();
  if (token) {
    const user = TokenManager.getUser();
    if (user) {
      if (user.role === 'admin') {
        window.location.href = '/admin-dashboard.html';
      } else {
        window.location.href = '/employee-dashboard.html';
      }
    }
  }
});

