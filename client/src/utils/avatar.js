/**
 * Resolve avatar URL for display (relative path -> full API URL).
 */
export function getAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http')) return avatarUrl;
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}/api/uploads/avatars/${avatarUrl}`;
}
