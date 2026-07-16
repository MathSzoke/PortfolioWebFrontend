export async function getOwnerPresence(apiBase: string, email: string) {
  const r = await fetch(`${apiBase}/api/v1/presence/owner?email=${encodeURIComponent(email)}`, { credentials: "include" });
  if (!r.ok) return { online: false };
  const online = await r.json();
  return { online: Boolean(online) };
}