const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const bodyParser = require("body-parser");
const data = [];
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.post("/aggiungiEvento", (request, response) => {
  if (request.body) {
    const { titolo, descrizione, dataora } = request.body;
    let trovato = false;
    data.forEach((element) => {
      if (element.titolo === titolo) {
        if (element.descrizione === descrizione) {
          if (element.dataora === dataora) {
            trovato = true;
          }
        }
      }
    });
    if (!trovato) {
      data.push({
        titolo: titolo,
        descrizione: descrizione,
        dataora: dataora,
        completato: false,
      });
      response.json({ result: "ok" });
    } else {
      response.json({ result: "element already exist" });
    }
  } else {
    response.json({ result: "request.body is not defined" });
  }
});

app.put("/confermaEvento", (request, response) => {
  const evento = request.body.evento;
  data.forEach((event) => {
    if (
      event.titolo === evento.titolo &&
      evento.descrizione === event.descrizione &&
      evento.dataora === event.dataora
    ) {
      event.completato = true;
      response.json({ result: "ok" });
    }
  });
});

app.delete("/eliminaEvento/:titolo", (request, response) => {
  const titolo = request.params.titolo;
  if (titolo && titolo != "") {
    let pos = 0;
    data.forEach((event) => {
      if (event.titolo === titolo) {
        data.splice(pos, 1);
      } else {
        pos++;
      }
    });
  }
  response.json({ result: "ok" });
});

app.post("/recuperaEventi", (request, response) => {
  response.json({ result: data });
});

server.listen(80, () => {
  console.log("-> server running");
});
