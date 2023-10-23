const alias = {
  js: 'application/javascript',
  css: 'text/css',
  html: 'text/html',
  json: 'application/json',
};

export function send(req, res, content, type) {
  res.setHeader('Content-Type', alias[type] || type);
  res.statusCode = 200;

  return res.end(content);
}
