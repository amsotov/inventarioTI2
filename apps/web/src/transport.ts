const approved = 'https://yhsfotxhaptinjtmrinn.supabase.co/functions/v1/inventarioti2-pages-api';
const base = import.meta.env.VITE_API_BASE || '';
if (base && base !== approved) throw Error('UNAPPROVED_API_ORIGIN');
export const apiCredentials: RequestCredentials = base ? 'include' : 'same-origin';
export function apiUrl(path: string) {
  if (!/^\/api\/v[12]\//.test(path) || path.includes('\\') || path.split('?')[0].includes('..')) throw Error('INVALID_API_PATH');
  return base + path;
}
