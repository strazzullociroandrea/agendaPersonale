const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const bodyParser = require("body-parser");
const data = [];
const sqlite3 = require("sqlite3").verbose();
/*
const recuperaData = () => {
  const db = new sqlite3.Database("eventi.db");
  db.run(
    "CREATE TABLE IF NOT EXISTS eventi (titolo TEXT, descrizione TEXT, dataora TEXT, completato INTEGER)",
  );
  // Seleziona dati dalla tabella
  db.each(
    "SELECT titolo, descrizione, dataora,completato FROM eventi",
    function (err, row) {
      if (err) {
        return console.error(err.message);
      }
      console.log("ciao");
      console.log(row);
    },
  );
  db.close();
};
*/
const salvaData = (element) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("eventi.db");
    db.run(
      "CREATE TABLE IF NOT EXISTS eventi (titolo TEXT, descrizione TEXT, dataora TEXT, completato INTEGER)",
    );
    const completatoValue = element.completato ? 1 : 0;
    db.run(
      "INSERT INTO eventi (titolo, descrizione,dataora,completato) VALUES (?, ?,?,?)",
      [element.titolo, element.descrizione, element.dataora, completatoValue],
      function (err) {
        if (err) {
          return console.error(err.message);
        }
        console.log("ok");
        resolve("ok");
      },
    );
    db.close();
  });
};

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
      salvaData({
        titolo: titolo,
        descrizione: descrizione,
        dataora: dataora,
        completato: false,
      }).then((res) => response.json({ result: "ok" }));
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
