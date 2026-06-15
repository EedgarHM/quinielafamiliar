// Compartir texto: usa el menú nativo del celular (Web Share API) si existe,
// y si no, abre WhatsApp Web con el mensaje precargado.

export function shareText(text: string) {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const full = url ? `${text}\n\n${url}` : text;

  if (typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ text: full }).catch(() => {});
    return;
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(full)}`;
  if (typeof window !== "undefined") window.open(wa, "_blank");
}
