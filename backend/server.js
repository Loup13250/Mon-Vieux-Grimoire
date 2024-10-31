const http = require("http");

const server = http.createServer((req, res) => {
  res.end("voila la réponse du 3er server !");
});

server.listen(4000);
