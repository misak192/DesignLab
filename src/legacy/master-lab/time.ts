/**
 * File: src/legacy/master-lab/time.ts
 * Description: Converts strict ISO timestamps into human-readable relative time (e.g., 2m, 4h).
 */
export function getRelativeTime(dateString: string): string {
  const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  return `${Math.floor(diffInHours / 24)}d`;
}