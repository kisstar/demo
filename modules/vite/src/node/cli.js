(async () => {
  const { createServer } = await import('./server/index.js');

  const server = await createServer();

  await server.listen();
})();
