// ===== INICIALIZACIÓN Y VARIABLES GLOBALES =====
let trabajadores = [];
let registros = [];
let feriados = [];
let trabajadorSeleccionado = null;
let modoActual = 'dia';

// ===== FUNCIONES DE UTILIDAD =====
function formatearHora(fecha) {
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
}

function formatearFecha(fecha) {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-SV', opciones);
}

function obtenerDiaDelNombre(fecha) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[fecha.getDay()];
}

// ===== RELOJ EN TIEMPO REAL =====
function actualizarReloj() {
    const ahora = new Date();
    const reloj = document.getElementById('relojHeader');
    const fechaHeader = document.getElementById('fechaActualHeader');
    
    if (reloj) {
        reloj.textContent = formatearHora(ahora);
    }
    if (fechaHeader) {
        fechaHeader.textContent = ahora.toLocaleDateString('es-SV', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// ===== INICIALIZACIÓN DE DATOS =====
function inicializarAplicacion() {
    // Cargar datos del localStorage
    cargarDatos();
    
    // Configurar fecha de turno por defecto
    const inputFecha = document.getElementById('fechaTurno');
    if (inputFecha) {
        const hoy = new Date();
        inputFecha.valueAsDate = hoy;
        actualizarFechaConDia();
    }
    
    // Generar trabajadores de ejemplo si no existen
    if (trabajadores.length === 0) {
        generarTrabajadoresEjemplo();
    }
    
    // Generar feriados
    if (feriados.length === 0) {
        generarFeriadosElSalvador();
    }
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Mostrar trabajadores en selectores
    mostrarTrabajadores();
    
    // Mostrar resumen inicial
    mostrarResumen();
    
    // Actualizar reloj cada segundo
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
}

// ===== DATOS DE EJEMPLO =====
function generarTrabajadoresEjemplo() {
    trabajadores = [
        { id: 1, codigo: 'T001', nombre: 'Juan García', cargo: 'Operario', salario: 408.80 },
        { id: 2, codigo: 'T002', nombre: 'María López', cargo: 'Supervisora', salario: 550.00 },
        { id: 3, codigo: 'T003', nombre: 'Carlos Mendez', cargo: 'Técnico', salario: 480.00 }
    ];
    guardarDatos();
}

function generarFeriadosElSalvador() {
    feriados = [
        { fecha: '2026-01-01', nombre: 'Año Nuevo' },
        { fecha: '2026-02-16', nombre: 'Lunes de Carnaval' },
        { fecha: '2026-02-17', nombre: 'Martes de Carnaval' },
        { fecha: '2026-03-26', nombre: 'Jueves Santo' },
        { fecha: '2026-03-27', nombre: 'Viernes Santo' },
        { fecha: '2026-05-01', nombre: 'Día del Trabajo' },
        { fecha: '2026-08-05', nombre: 'Transfiguración' },
        { fecha: '2026-09-15', nombre: 'Independencia Nacional' },
        { fecha: '2026-11-02', nombre: 'Día de Difuntos' },
        { fecha: '2026-11-05', nombre: 'Aniversario de la Primera Junta' },
        { fecha: '2026-12-25', nombre: 'Navidad' }
    ];
}

// ===== ALMACENAMIENTO LOCAL =====
function guardarDatos() {
    localStorage.setItem('trabajadores', JSON.stringify(trabajadores));
    localStorage.setItem('registros', JSON.stringify(registros));
}

function cargarDatos() {
    const t = localStorage.getItem('trabajadores');
    const r = localStorage.getItem('registros');
    
    if (t) trabajadores = JSON.parse(t);
    if (r) registros = JSON.parse(r);
}

// ===== MOSTRAR TRABAJADORES =====
function mostrarTrabajadores() {
    const selector = document.getElementById('selectorTrabajador');
    const selectorFinanzas = document.getElementById('selectorFinanzasTrabajador');
    
    if (selector) {
        selector.innerHTML = '';
        trabajadores.forEach(t => {
            const boton = document.createElement('button');
            boton.className = 'trabajador-boton';
            boton.innerHTML = `
                <span class="nombre-completo">${t.nombre}</span>
                <span class="codigo">${t.codigo}</span>
                <span class="cargo">${t.cargo}</span>
            `;
            boton.addEventListener('click', () => seleccionarTrabajador(t));
            selector.appendChild(boton);
        });
    }
    
    if (selectorFinanzas) {
        selectorFinanzas.innerHTML = '';
        trabajadores.forEach(t => {
            const boton = document.createElement('button');
            boton.className = 'trabajador-boton';
            boton.innerHTML = `
                <span class="nombre-completo">${t.nombre}</span>
                <span class="codigo">${t.codigo}</span>
                <span class="cargo">${t.cargo}</span>
            `;
            boton.addEventListener('click', () => seleccionarTrabajadorFinanzas(t));
            selectorFinanzas.appendChild(boton);
        });
    }
}

function seleccionarTrabajador(trabajador) {
    trabajadorSeleccionado = trabajador;
    
    // Actualizar estilos
    document.querySelectorAll('#selectorTrabajador .trabajador-boton').forEach(btn => {
        btn.classList.remove('seleccionado');
    });
    event.target.closest('.trabajador-boton').classList.add('seleccionado');
    
    mostrarNotificacion(`Trabajador seleccionado: ${trabajador.nombre}`, 'success');
}

function seleccionarTrabajadorFinanzas(trabajador) {
    trabajadorSeleccionado = trabajador;
    
    // Actualizar estilos
    document.querySelectorAll('#selectorFinanzasTrabajador .trabajador-boton').forEach(btn => {
        btn.classList.remove('seleccionado');
    });
    event.target.closest('.trabajador-boton').classList.add('seleccionado');
    
    mostrarResumenFinanzas(trabajador);
}

// ===== MANEJO DE FECHAS Y HORAS =====
function actualizarFechaConDia() {
    const inputFecha = document.getElementById('fechaTurno');
    const contenedorFecha = document.getElementById('fechaConDia');
    
    if (inputFecha && inputFecha.value) {
        const fecha = new Date(inputFecha.value);
        const dia = obtenerDiaDelNombre(fecha);
        const opciones = { month: 'long', day: 'numeric', year: 'numeric' };
        const fechaFormato = fecha.toLocaleDateString('es-SV', opciones);
        
        contenedorFecha.innerHTML = `<span class="dia">${dia}</span> ${fechaFormato}`;
    }
}

// ===== RESUMEN =====
function mostrarResumen() {
    const ahora = new Date();
    const diaDelMes = ahora.getDate();
    
    // Días de la quincena actual
    const diasQuincena = diaDelMes <= 15 ? `1-15` : `16-30`;
    const statDias = document.getElementById('statDiasQuincena');
    if (statDias) statDias.textContent = diasQuincena;
    
    // Trabajadores activos
    const statTrabajadores = document.getElementById('statTrabajadoresActivos');
    if (statTrabajadores) statTrabajadores.textContent = trabajadores.length;
    
    // Próximo pago
    const proximoPagoFecha = document.getElementById('proximoPagoFecha');
    const diasRestantes = document.getElementById('diasRestantesPago');
    
    if (proximoPagoFecha && diasRestantes) {
        const proximoPago = calcularProximoPago(ahora);
        proximoPagoFecha.textContent = proximoPago.fecha;
        diasRestantes.textContent = proximoPago.dias + ' días';
    }
    
    // Próximos feriados
    mostrarProximosFeriados();
    
    // Resumen de trabajadores
    mostrarResumenTrabajadores();
}

function calcularProximoPago(fecha) {
    let proximoPago;
    const dia = fecha.getDate();
    const mes = fecha.getMonth();
    const año = fecha.getFullYear();
    
    if (dia < 15) {
        proximoPago = new Date(año, mes, 15);
    } else {
        proximoPago = new Date(año, mes + 1, 0); // Último día del mes (30 o 31)
    }
    
    const ahora = new Date();
    const diferencia = proximoPago - ahora;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    return {
        fecha: proximoPago.toLocaleDateString('es-SV', { month: 'long', day: 'numeric' }),
        dias: Math.max(dias, 0)
    };
}

function mostrarProximosFeriados() {
    const container = document.getElementById('proximosFeriadosResumen');
    if (!container) return;
    
    const ahora = new Date();
    const feriadosProximos = feriados.filter(f => new Date(f.fecha) >= ahora).slice(0, 3);
    
    if (feriadosProximos.length === 0) {
        container.innerHTML = '<p style="color:#8a8aaa;">No hay feriados próximos.</p>';
        return;
    }
    
    container.innerHTML = feriadosProximos.map(f => {
        const fecha = new Date(f.fecha);
        return `
            <div class="feriado-item">
                <div class="info">
                    <div class="nombre">${f.nombre}</div>
                    <div class="fecha">${fecha.toLocaleDateString('es-SV', { month: 'long', day: 'numeric' })}</div>
                </div>
                <span class="estado proximo">Próximo</span>
            </div>
        `;
    }).join('');
}

function mostrarResumenTrabajadores() {
    const container = document.getElementById('resumenTrabajadores');
    if (!container) return;
    
    if (registros.length === 0) {
        container.innerHTML = '<p style="color:#8a8aaa;">No hay registros aún.</p>';
        return;
    }
    
    const resumen = {};
    trabajadores.forEach(t => {
        resumen[t.id] = { nombre: t.nombre, horas: 0, registros: 0 };
    });
    
    registros.forEach(r => {
        if (resumen[r.trabajadorId]) {
            resumen[r.trabajadorId].horas += r.horasExtras || 0;
            resumen[r.trabajadorId].registros += 1;
        }
    });
    
    container.innerHTML = Object.values(resumen)
        .filter(r => r.registros > 0)
        .map(r => `
            <div class="worker-card">
                <div class="header">
                    <span class="nombre">${r.nombre}</span>
                    <span class="codigo-area">${r.registros} registros</span>
                </div>
                <div class="stats">
                    <div class="item">
                        <span class="label">Registros</span>
                        <span class="value">${r.registros}</span>
                    </div>
                    <div class="item">
                        <span class="label">Horas Extras</span>
                        <span class="value">${r.horas.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `).join('');
}

function mostrarResumenFinanzas(trabajador) {
    const container = document.getElementById('resumenSalarioBase');
    if (!container) return;
    
    container.innerHTML = `
        <div class="fila">
            <span class="label">Salario base mensual</span>
            <span class="valor positivo">$${trabajador.salario.toFixed(2)}</span>
        </div>
        <div class="fila">
            <span class="label">Salario diario</span>
            <span class="valor">$${(trabajador.salario / 30).toFixed(2)}</span>
        </div>
        <div class="fila">
            <span class="label">Salario por hora</span>
            <span class="valor">$${(trabajador.salario / 240).toFixed(2)}</span>
        </div>
    `;
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificaciones');
    if (!container) return;
    
    const notif = document.createElement('div');
    notif.className = `notif ${tipo}`;
    notif.innerHTML = `
        <span>${mensaje}</span>
        <button class="cerrar" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(notif);
    
    setTimeout(() => {
        if (notif.parentElement) notif.remove();
    }, 3000);
}

// ===== MANEJO DE TEMAS =====
function cambiarTema(tema) {
    document.body.className = `modo-${tema}`;
    modoActual = tema;
    localStorage.setItem('tema', tema);
    
    // Actualizar botones activos
    document.querySelectorAll('.selector-modo button').forEach(btn => {
        btn.classList.remove('activo');
    });
    document.querySelector(`[data-modo="${tema}"]`).classList.add('activo');
}

// ===== NAVEGACIÓN =====
function mostrarTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('activo');
    });
    
    // Mostrar tab seleccionado
    const panel = document.getElementById(`panel-${tabName}`);
    if (panel) {
        panel.classList.add('activo');
    }
    
    // Actualizar menú
    document.querySelectorAll('.sidebar .menu a').forEach(link => {
        link.classList.remove('activo');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('activo');
    
    // Actualizar título
    const iconos = {
        resumen: '📊',
        registro: '✏️',
        horas: '📋',
        boleta: '🧾',
        reportes: '📈',
        finanzas: '💰',
        calendario: '📅',
        configuracion: '⚙️',
        backups: '💾'
    };
    
    document.getElementById('tituloSeccion').innerHTML = `<span>${iconos[tabName]}</span> ${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`;
}

// ===== EVENT LISTENERS =====
function configurarEventListeners() {
    // Menú de navegación
    document.querySelectorAll('[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            const tabName = e.currentTarget.getAttribute('data-tab');
            mostrarTab(tabName);
            cerrarSidebar();
        });
    });
    
    // Selector de tema
    document.querySelectorAll('[data-modo]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modo = e.currentTarget.getAttribute('data-modo');
            cambiarTema(modo);
        });
    });
    
    // Hamburger menú
    document.getElementById('hamburgerBtn').addEventListener('click', abrirSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', cerrarSidebar);
    
    // Fecha del turno
    const fechaTurno = document.getElementById('fechaTurno');
    if (fechaTurno) {
        fechaTurno.addEventListener('change', actualizarFechaConDia);
    }
    
    // Guardar registro
    const btnGuardar = document.getElementById('btnGuardar');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarRegistro);
    }
    
    // Limpiar formulario
    const btnLimpiar = document.getElementById('btnLimpiar');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFormulario);
    }
    
    // Botones de hora
    document.querySelectorAll('.btn-hora').forEach(btn => {
        btn.addEventListener('click', ajustarHora);
    });
    
    // Cafetería
    const cafeteriaDias = document.getElementById('cafeteriaDias');
    if (cafeteriaDias) {
        cafeteriaDias.addEventListener('change', calcularCafeteria);
    }
    
    // Feriado select
    const feriadoSelect = document.getElementById('feriadoSelect');
    if (feriadoSelect) {
        feriadoSelect.addEventListener('change', mostrarCampoHorasExtraFeriado);
    }
}

function abrirSidebar() {
    document.getElementById('sidebar').classList.add('abierto');
    document.getElementById('sidebarOverlay').classList.add('visible');
}

function cerrarSidebar() {
    document.getElementById('sidebar').classList.remove('abierto');
    document.getElementById('sidebarOverlay').classList.remove('visible');
}

// ===== REGISTRO DE HORAS =====
function guardarRegistro() {
    if (!trabajadorSeleccionado) {
        mostrarNotificacion('Selecciona un trabajador', 'error');
        return;
    }
    
    const fecha = document.getElementById('fechaTurno').value;
    const horaEntrada = document.getElementById('horaEntrada').value;
    const horaSalida = document.getElementById('horaSalida').value;
    
    if (!fecha || !horaEntrada || !horaSalida) {
        mostrarNotificacion('Complete todos los campos', 'error');
        return;
    }
    
    const registro = {
        id: Date.now(),
        trabajadorId: trabajadorSeleccionado.id,
        fecha: fecha,
        horaEntrada: horaEntrada,
        horaSalida: horaSalida,
        horasExtras: calcularHorasExtras(horaEntrada, horaSalida)
    };
    
    registros.push(registro);
    guardarDatos();
    mostrarNotificacion(`Registro guardado para ${trabajadorSeleccionado.nombre}`, 'success');
    mostrarResumen();
    limpiarFormulario();
}

function limpiarFormulario() {
    document.getElementById('horaEntrada').value = '08:00 AM';
    document.getElementById('horaSalida').value = '05:00 PM';
    document.getElementById('feriadoSelect').value = 'no';
    trabajadorSeleccionado = null;
    
    document.querySelectorAll('.trabajador-boton').forEach(btn => {
        btn.classList.remove('seleccionado');
    });
}

function ajustarHora(e) {
    const ajuste = parseInt(e.target.getAttribute('data-ajuste'));
    const target = e.target.getAttribute('data-target');
    const inputId = target === 'entrada' ? 'horaEntrada' : 'horaSalida';
    const input = document.getElementById(inputId);
    
    const partes = input.value.match(/(\d{1,2}):(\d{2})\s(AM|PM)/);
    if (!partes) return;
    
    let horas = parseInt(partes[1]);
    let minutos = parseInt(partes[2]);
    const periodo = partes[3];
    
    minutos += ajuste;
    if (minutos >= 60) {
        horas += 1;
        minutos -= 60;
    } else if (minutos < 0) {
        horas -= 1;
        minutos += 60;
    }
    
    if (horas > 12) {
        horas = 1;
    } else if (horas <= 0) {
        horas = 12;
    }
    
    input.value = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')} ${periodo}`;
}

function calcularHorasExtras(entrada, salida) {
    // Conversión simple: asumir formato hh:mm AM/PM
    return 8; // Ejemplo básico
}

function mostrarCampoHorasExtraFeriado() {
    const select = document.getElementById('feriadoSelect');
    const campo = document.getElementById('campoHorasExtraFeriado');
    
    if (select.value === 'extra') {
        campo.style.display = 'block';
    } else {
        campo.style.display = 'none';
    }
}

function calcularCafeteria() {
    const dias = parseInt(document.getElementById('cafeteriaDias').value) || 0;
    const total = dias * 1.60;
    document.getElementById('cafeteriaTotal').textContent = `$${total.toFixed(2)}`;
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', inicializarAplicacion);

// Cargar tema guardado
const temaGuardado = localStorage.getItem('tema') || 'dia';
cambiarTema(temaGuardado);
