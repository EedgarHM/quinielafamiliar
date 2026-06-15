// Formateo de fechas de partidos (ISO "YYYY-MM-DD") en español.
// Se fija a mediodía UTC para que la zona horaria no cambie el día.

function toDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`);
}

const SHORT = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});

const LONG = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "11 jun" */
export function formatDateShort(iso: string) {
  return SHORT.format(toDate(iso)).replace(".", "");
}

/** "Jueves 11 de junio" (solo la primera letra en mayúscula) */
export function formatDateLong(iso: string) {
  const s = LONG.format(toDate(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
