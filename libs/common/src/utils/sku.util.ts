export function generateSku(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `SKU-${random}-${timestamp}`;
}
