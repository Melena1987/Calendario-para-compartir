interface Holiday {
  date: string; // YYYY-MM-DD
  title: string;
}

// Nota: Esta es una lista de festivos nacionales. No incluye festivos regionales o locales.
// Algunos festivos que caen en domingo pueden ser trasladados al lunes siguiente.
export const spanishHolidays: Holiday[] = [
  // 2024
  { date: '2024-01-01', title: 'Año Nuevo' },
  { date: '2024-01-06', title: 'Epifanía del Señor' },
  { date: '2024-03-29', title: 'Viernes Santo' },
  { date: '2024-05-01', title: 'Fiesta del Trabajo' },
  { date: '2024-08-15', title: 'Asunción de la Virgen' },
  { date: '2024-10-12', title: 'Fiesta Nacional de España' },
  { date: '2024-11-01', title: 'Todos los Santos' },
  { date: '2024-12-06', title: 'Día de la Constitución' },
  { date: '2024-12-09', title: 'Inmaculada Concepción (Trasladado)' }, // El 8 es domingo
  { date: '2024-12-25', title: 'Navidad' },

  // 2025
  { date: '2025-01-01', title: 'Año Nuevo' },
  { date: '2025-01-06', title: 'Epifanía del Señor' },
  { date: '2025-04-18', title: 'Viernes Santo' },
  { date: '2025-05-01', title: 'Fiesta del Trabajo' },
  { date: '2025-08-15', title: 'Asunción de la Virgen' },
  { date: '2025-10-12', title: 'Fiesta Nacional de España' },
  { date: '2025-11-01', title: 'Todos los Santos' },
  { date: '2025-12-06', title: 'Día de la Constitución' },
  { date: '2025-12-08', title: 'Inmaculada Concepción' },
  { date: '2025-12-25', title: 'Navidad' },

  // 2026
  { date: '2026-01-01', title: 'Año Nuevo' },
  { date: '2026-01-06', title: 'Epifanía del Señor' },
  { date: '2026-04-03', title: 'Viernes Santo' },
  { date: '2026-05-01', title: 'Fiesta del Trabajo' },
  { date: '2026-08-15', title: 'Asunción de la Virgen' },
  { date: '2026-10-12', title: 'Fiesta Nacional de España' },
  { date: '2026-11-01', title: 'Todos los Santos' },
  { date: '2026-12-07', title: 'Día de la Constitución (Trasladado)' }, // El 6 es domingo
  { date: '2026-12-08', title: 'Inmaculada Concepción' },
  { date: '2026-12-25', title: 'Navidad' },
];
