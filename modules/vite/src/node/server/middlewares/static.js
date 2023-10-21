import sirv from 'sirv';

export function servePublicMiddleware(dir) {
  const serve = sirv(dir, {
    dev: true,
    etag: true,
    extensions: [],
  });

  return serve;
}
