export function generateRandomString(length: number) {
  const chars =
    '0123456789abcdefghijklmnopqrstuvwxyz!$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ ';

  let s = '';
  for (let i = 0; i < length; i++) {
    const randomNumber = Math.floor(Math.random() * chars.length);
    s += chars.substring(randomNumber, randomNumber + 1);
  }

  return s;
}
