export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function calculateExpiryTime(hoursFromNow: number): Date {
  const now = new Date();
  now.setHours(now.getHours() + hoursFromNow);
  return now;
}
