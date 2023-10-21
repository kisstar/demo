export async function resolveHttpServer(app) {
  const { createServer } = await import('node:http');

  return createServer(app);
}
