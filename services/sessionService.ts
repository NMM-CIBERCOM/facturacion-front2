import { TIENDA_OPTIONS } from '../constants';

// Obtiene idUsuario desde localStorage y asegura persistencia en clave de sesión
export function getSessionIdUsuario(): string {
  try {
    const fromUsername = window.localStorage.getItem('username');
    const existing = window.localStorage.getItem('session.idUsuario');
    const id = fromUsername || existing;
    if (id) {
      window.localStorage.setItem('session.idUsuario', id);
      return id;
    }
  } catch {}
  const fallback = 'USUARIO_DEMO';
  try { window.localStorage.setItem('session.idUsuario', fallback); } catch {}
  return fallback;
}

// Intenta derivar la tienda desde el perfil guardado en sesión
function deriveTiendaFromPerfil(): string | null {
  try {
    const raw = window.localStorage.getItem('perfil');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    // Solo intentar parsear si parece un objeto JSON
    const perfil = raw.trim().startsWith('{') ? JSON.parse(raw) : null;
    if (!perfil) return null;
    // Preferir ID_TIENDA si está disponible en el objeto de perfil
    if (perfil.idTienda) return String(perfil.idTienda);
    if (perfil.tienda?.idTienda) return String(perfil.tienda.idTienda);
    // Si no hay ID, usar CODIGO_TIENDA
    if (perfil.codigoTienda) return String(perfil.codigoTienda);
    if (perfil.tienda?.codigoTienda) return String(perfil.tienda.codigoTienda);
    if (perfil.tienda) return String(perfil.tienda);
    return null;
  } catch {
    return null;
  }
}

// Obtiene idTienda desde sesión (perfil/selección) con fallback y asegura persistencia
export function getSessionIdTienda(): string {
  try {
    const existing = window.localStorage.getItem('session.idTienda');
    if (existing) return existing;
    const seleccionada = window.localStorage.getItem('tiendaSeleccionada');
    const fromPerfil = deriveTiendaFromPerfil();
    const fallback = seleccionada || (TIENDA_OPTIONS[0]?.value || 'S001');
    const id = fromPerfil || fallback;
    window.localStorage.setItem('session.idTienda', id);
    return id;
  } catch {
    const id = TIENDA_OPTIONS[0]?.value || 'S001';
    try { window.localStorage.setItem('session.idTienda', id); } catch {}
    return id;
  }
}

// Obtiene el código de tienda (CODIGO_TIENDA). Si no existe, usa la selección o el primer código de constantes.
export function getSessionCodigoTienda(): string {
  try {
    const existing = window.localStorage.getItem('session.codigoTienda');
    if (existing) return existing;
    const perfilRaw = window.localStorage.getItem('perfil');
    let codigo: string | null = null;
    if (perfilRaw) {
      try {
        const perfil = JSON.parse(perfilRaw);
        codigo = perfil?.codigoTienda || perfil?.tienda?.codigoTienda || null;
      } catch {}
    }
    // Si hay una tienda seleccionada globalmente, asumir que guarda CODIGO_TIENDA
    const seleccionada = window.localStorage.getItem('tiendaSeleccionada');
    const resolved = codigo || seleccionada || (TIENDA_OPTIONS[0]?.value || 'S001');
    window.localStorage.setItem('session.codigoTienda', resolved);
    return resolved;
  } catch {
    const resolved = TIENDA_OPTIONS[0]?.value || 'S001';
    try { window.localStorage.setItem('session.codigoTienda', resolved); } catch {}
    return resolved;
  }
}

// Establece explícitamente el CODIGO_TIENDA en sesión y selección global
export function setSessionCodigoTienda(codigo: string) {
  try {
    if (!codigo) return;
    window.localStorage.setItem('session.codigoTienda', codigo);
    window.localStorage.setItem('tiendaSeleccionada', codigo);
  } catch {}
}

// Establece explícitamente el ID_TIENDA en sesión
export function setSessionIdTienda(id: string | number) {
  try {
    const value = String(id);
    if (!value) return;
    window.localStorage.setItem('session.idTienda', value);
  } catch {}
}

// Asegura que las claves básicas de sesión existan
export function ensureSessionDefaults(): void {
  getSessionIdUsuario();
  getSessionIdTienda();
}

// Persiste y obtiene el último periodo usado para intereses
export function getLastPeriodoIntereses(): string {
  try {
    return window.localStorage.getItem('session.periodoIntereses.last') || '';
  } catch {
    return '';
  }
}

export function setLastPeriodoIntereses(periodo: string): void {
  try {
    if (periodo) window.localStorage.setItem('session.periodoIntereses.last', periodo);
  } catch {}
}

// Manejo de idReceptor en sesión para flujos de facturación
export function getSessionIdReceptor(): string | null {
  try {
    return window.localStorage.getItem('session.idReceptor');
  } catch {
    return null;
  }
}

export function setSessionIdReceptor(id: string | null): void {
  try {
    if (id) window.localStorage.setItem('session.idReceptor', id);
    else window.localStorage.removeItem('session.idReceptor');
  } catch {}
}