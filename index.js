const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const bodyParser = require("body-parser");
const data = [];
const sqlite3 = require("sqlite3").verbose();

const recuperaData = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("eventi.db");
    // Seleziona dati dalla tabella
    db.all(
      "SELECT titolo, descrizione, dataora, completato FROM eventi",
      function (err, rows) {
        if (err) {
          reject(err);
          return console.error(err.message);
        }
        resolve(rows);
      }
    );
    db.close();
  });
};

const salvaData = (element) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("eventi.db");
    db.run(
      "CREATE TABLE IF NOT EXISTS eventi (titolo TEXT, descrizione TEXT, dataora TEXT, completato INTEGER)",
    );
    const completatoValue = element.completato ? 1 : 0;
    db.run(
      "INSERT INTO eventi (titolo, descrizione, dataora, completato) VALUES (?, ?, ?, ?)",
      [element.titolo, element.descrizione, element.dataora, completatoValue],
      function (err) {
        if (err) {
          reject(err);
          return console.error(err.message);
        }
        console.log("ok");
        resolve("ok");
      }
    );
    db.close();
  });
};

app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.post("/aggiungiEvento", async (request, response) => {
  if (request.body) {
    const { titolo, descrizione, dataora } = request.body;
    let trovato = false;
    data.forEach((element) => {
      if (element.titolo === titolo && element.descrizione === descrizione && element.dataora === dataora) {
        trovato = true;
      }
    });
    if (!trovato) {
      data.push({
        titolo: titolo,
        descrizione: descrizione,
        dataora: dataora,
        completato: false,
      });
      try {
        await salvaData({
          titolo: titolo,
          descrizione: descrizione,
          dataora: dataora,
          completato: false,
        });
        response.json({ result: "ok" });
      } catch (error) {
        response.json({ result: "error", message: error.message });
      }
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
    if (event.titolo === evento.titolo && event.descrizione === evento.descrizione && event.dataora === evento.dataora) {
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

app.post("/recuperaEventi", async (request, response) => {
  try {
    const eventData = await recuperaData();
    response.json({ result: eventData });
  } catch (error) {
    response.json({ result: "error", message: error.message });
  }
});

server.listen(80, () => {
  console.log("-> server running");
});
