// Dashboard de administrador
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación y rol admin
  if (!requireAuth() || !requireAdmin()) return;
  
  const user = TokenManager.getUser();
  
  // Configurar botón de cerrar sesión
  const logoutBtn = document.querySelector('.btn-outline-light');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AuthAPI.logout();
    });
  }
  
  // Cargar usuarios
  async function loadUsers() {
    try {
      const result = await AdminAPI.listUsers();
      const tbody = document.querySelector('table tbody');
      
      if (tbody) {
        tbody.innerHTML = '';
        
        if (result && result.length > 0) {
          result.forEach((u, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${u.username}</td>
              <td><span class="badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}">${u.role}</span></td>
              <td>
                <button class="btn btn-sm btn-warning" onclick="editUser('${u._id || u.id}')">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${u._id || u.id}')">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            `;
            tbody.appendChild(row);
          });
        } else {
          tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay usuarios</td></tr>';
        }
      }
      
      // Actualizar KPI de usuarios
      const userCountElement = document.querySelector('.text-primary');
      if (userCountElement && result) {
        userCountElement.textContent = result.length || 0;
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      alert('Error al cargar usuarios: ' + error.message);
    }
  }
  
  // Cargar estadísticas
  async function loadStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const report = await AttendanceAPI.getGlobalReport('day', today);
      
      // Actualizar KPIs
      const horasElement = document.querySelectorAll('.text-success')[0];
      if (horasElement && report.horasTotales) {
        horasElement.textContent = report.horasTotales;
      }
      
      const tardanzasElement = document.querySelectorAll('.text-danger')[0];
      if (tardanzasElement && report.tardanzas !== undefined) {
        tardanzasElement.textContent = report.tardanzas;
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }
  
  // Crear nuevo usuario
  window.createNewUser = function() {
    const username = prompt('Ingrese el nombre de usuario:');
    if (!username) return;
    
    const password = prompt('Ingrese la contraseña:');
    if (!password) return;
    
    const role = prompt('Ingrese el rol (empleado/admin):', 'empleado');
    
    (async () => {
      try {
        await AdminAPI.createUser({ username, password, role });
        alert('Usuario creado correctamente');
        await loadUsers();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    })();
  };
  
  // Editar usuario
  window.editUser = function(userId) {
    const newPassword = prompt('Ingrese la nueva contraseña (dejar vacío para no cambiar):');
    if (newPassword === null) return;
    
    const updates = {};
    if (newPassword) {
      updates.password = newPassword;
    }
    
    (async () => {
      try {
        await AdminAPI.updateUser(userId, updates);
        alert('Usuario actualizado correctamente');
        await loadUsers();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    })();
  };
  
  // Eliminar usuario
  window.deleteUser = function(userId) {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    
    (async () => {
      try {
        await AdminAPI.deleteUser(userId);
        alert('Usuario eliminado correctamente');
        await loadUsers();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    })();
  };
  
  // Botón nuevo usuario
  const newUserBtn = document.querySelector('.btn-primary');
  if (newUserBtn) {
    newUserBtn.addEventListener('click', createNewUser);
  }
  
  // Cargar datos iniciales
  await loadUsers();
  await loadStats();
  
  // Recargar estadísticas cada minuto
  setInterval(loadStats, 60000);
});

