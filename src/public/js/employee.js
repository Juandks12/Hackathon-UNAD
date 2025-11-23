// Dashboard de empleado
document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación
  if (!requireAuth()) return;
  
  const user = TokenManager.getUser();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }
  
  // Actualizar nombre de usuario
  const welcomeElement = document.querySelector('h2');
  if (welcomeElement) {
    welcomeElement.textContent = `Bienvenido, ${user.username}`;
  }
  
  // Configurar botón de cerrar sesión
  const logoutBtn = document.querySelector('.btn-outline-light');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      AuthAPI.logout();
    });
  }
  
  // Estado actual
  let currentStatus = null;
  let hasActiveEntry = false;
  
  // Cargar estado actual
  async function loadCurrentStatus() {
    try {
      const status = await AttendanceAPI.getCurrentStatus();
      currentStatus = status;
      hasActiveEntry = status.hasActiveEntry;
      updateButtons();
      
      if (hasActiveEntry && status.attendance) {
        const checkInTime = new Date(status.attendance.checkIn);
        document.getElementById('currentCheckIn')?.remove();
        const checkInInfo = document.createElement('div');
        checkInInfo.id = 'currentCheckIn';
        checkInInfo.className = 'alert alert-info mt-3';
        checkInInfo.innerHTML = `
          <strong>Entrada registrada:</strong> ${checkInTime.toLocaleString('es-ES')}
          <br><strong>Horas trabajadas:</strong> ${status.horasTrabajadas} horas
        `;
        const buttonsContainer = document.querySelector('.text-center');
        if (buttonsContainer) {
          buttonsContainer.appendChild(checkInInfo);
        }
      }
    } catch (error) {
      console.error('Error al cargar estado:', error);
    }
  }
  
  // Actualizar botones según el estado
  function updateButtons() {
    const checkInBtn = document.querySelector('.btn-primary');
    const checkOutBtn = document.querySelector('.btn-danger');
    
    if (checkInBtn) {
      checkInBtn.disabled = hasActiveEntry;
      checkInBtn.innerHTML = hasActiveEntry 
        ? '<i class="bi bi-check-circle"></i> Ya registraste entrada'
        : '<i class="bi bi-box-arrow-in-right"></i> Check-In';
    }
    
    if (checkOutBtn) {
      checkOutBtn.disabled = !hasActiveEntry;
      checkOutBtn.innerHTML = hasActiveEntry
        ? '<i class="bi bi-box-arrow-left"></i> Check-Out'
        : '<i class="bi bi-box-arrow-left"></i> Check-Out (Requiere entrada)';
    }
  }
  
  // Botón Check-In
  const checkInBtn = document.querySelector('.btn-primary');
  if (checkInBtn) {
    checkInBtn.addEventListener('click', async () => {
      if (hasActiveEntry) return;
      
      checkInBtn.disabled = true;
      checkInBtn.textContent = 'Registrando...';
      
      try {
        const result = await AttendanceAPI.checkIn();
        alert(result.message || 'Entrada registrada correctamente');
        await loadCurrentStatus();
        await loadAttendanceHistory();
      } catch (error) {
        alert('Error: ' + error.message);
        checkInBtn.disabled = false;
        checkInBtn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Check-In';
      }
    });
  }
  
  // Botón Check-Out
  const checkOutBtn = document.querySelector('.btn-danger');
  if (checkOutBtn) {
    checkOutBtn.addEventListener('click', async () => {
      if (!hasActiveEntry) return;
      
      checkOutBtn.disabled = true;
      checkOutBtn.textContent = 'Registrando...';
      
      try {
        const result = await AttendanceAPI.checkOut();
        alert(result.message || 'Salida registrada correctamente');
        await loadCurrentStatus();
        await loadAttendanceHistory();
      } catch (error) {
        alert('Error: ' + error.message);
        checkOutBtn.disabled = false;
        checkOutBtn.innerHTML = '<i class="bi bi-box-arrow-left"></i> Check-Out';
      }
    });
  }
  
  // Cargar historial de asistencia
  async function loadAttendanceHistory() {
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const result = await AttendanceAPI.getMyAttendance(
        firstDay.toISOString().split('T')[0],
        lastDay.toISOString().split('T')[0]
      );
      
      const tbody = document.querySelector('table tbody');
      if (tbody) {
        tbody.innerHTML = '';
        
        if (result.attendances && result.attendances.length > 0) {
          result.attendances.forEach(att => {
            const checkIn = new Date(att.checkIn);
            const checkOut = att.checkOut ? new Date(att.checkOut) : null;
            
            let horasTrabajadas = '-';
            if (checkOut) {
              const diff = checkOut - checkIn;
              const hours = Math.floor(diff / (1000 * 60 * 60));
              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              horasTrabajadas = `${hours}h ${minutes}m`;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${checkIn.toLocaleDateString('es-ES')}</td>
              <td>${checkIn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
              <td>${checkOut ? checkOut.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
              <td>${horasTrabajadas}</td>
              <td class="${att.tardanza ? 'text-danger' : 'text-success'}">
                ${att.tardanza ? 'Sí' : 'No'}
              </td>
            `;
            tbody.appendChild(row);
          });
        } else {
          tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay registros</td></tr>';
        }
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      const tbody = document.querySelector('table tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error al cargar datos</td></tr>';
      }
    }
  }
  
  // Actualizar hora cada segundo
  setInterval(() => {
    const horaElement = document.getElementById('hora');
    if (horaElement) {
      horaElement.textContent = new Date().toLocaleTimeString('es-ES');
    }
  }, 1000);
  
  // Cargar datos iniciales
  await loadCurrentStatus();
  await loadAttendanceHistory();
});

