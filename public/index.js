const titolo = document.getElementById("titolo");
const descrizione = document.getElementById("descrizione");
const modalAttivita = new bootstrap.Modal("#aggiungiEvento");
const aggiungiAttivita = document.getElementById("aggiungiAttivita");
const calendar = document.getElementById("calendar");
const dataora = document.getElementById("dataora");
const aggiungiEvento = document.getElementById("aggiungiEvento");

const confermaEvento = (evento) => {
  return new Promise((resolve, reject) => {
    fetch("/confermaEvento", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        evento: evento,
      }),
    })
      .then((response) => response.json())
      .then((response) => resolve(response));
  });
};

const eliminaEvento = (titolo) => {
  return new Promise((resolve, reject) => {
    fetch("/eliminaEvento/" + titolo, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => resolve(response));
  });
};

const render = (recupera) => {
  recupera.then((response) => {
    const results = response.result;
    let id = 0;
    let html =
      "<tr><th>Titolo</th><th>Descrizione</th><th>Data ed ora</th><th>Conferma</th><th>Elimina</th></tr>";
    results.forEach((result) => {
      const { titolo, descrizione, dataora, completato } = result;
      const value = () => {
        if (completato) return "text-success";
        else return "text-light";
      };
      console.log(value());
      html +=
        "<tr class='" +
        value() +
        "'><td class='" +
        value() +
        "'>" +
        titolo +
        "</td><td class='" +
        value() +
        "'>" +
        descrizione +
        "</td><td class='" +
        value() +
        "'>" +
        dataora.replace("T", " ").replaceAll("-", "/") +
        "</td><td><input type='button' class='btn conferma' id='ok" +
        id +
        "' value='✅'></td><td><input type='button' class='btn elimina' value='❌' id='elimina" +
        id +
        "''</td></tr>";
      id++;
    });
    calendar.innerHTML = html;

    const buttons = document.querySelectorAll(".conferma");
    buttons.forEach((button) => {
      button.onclick = () => {
        confermaEvento(results[parseInt(button.id.replace("ok", ""))]).then(
          (response) => render(recuperaDati()),
        );
      };
    });
    const deletes = document.querySelectorAll(".elimina");
    deletes.forEach((del) => {
      del.onclick = () => {
        eliminaEvento(
          results[parseInt(del.id.replace("elimina", ""))].titolo,
        ).then((response) => render(recuperaDati()));
      };
    });
  });
};
const salvaDati = () => {
  return new Promise((resolve, reject) => {
    fetch("/aggiungiEvento", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        titolo: titolo.value,
        descrizione: descrizione.value,
        dataora: dataora.value,
      }),
    })
      .then((response) => response.json())
      .then((response) => resolve(response))
      .catch((error) => reject(error));
  });
};

const recuperaDati = () => {
  return new Promise((resolve, reject) => {
    fetch("/recuperaEventi", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => resolve(response));
  });
};
render(recuperaDati());

aggiungiAttivita.onclick = () => {
  if (titolo.value != "" && descrizione != "" && dataora.value != "") {
    salvaDati().then((response) => {
      if (response.result == "ok") {
        if (titolo.classList.contains("border-danger")) {
          titolo.classList.remove("border-danger");
          descrizione.classList.remove("border-danger");
          dataora.classList.remove("border-danger");
        }
        titolo.value = "";
        descrizione.value = "";
        dataora.value = "";
        modalAttivita.hide();
        render(recuperaDati());
      } else {
        titolo.classList.add("border-danger");
        descrizione.classList.add("border-danger");
        dataora.classList.add("border-danger");
      }
    });
  } else {
    titolo.classList.add("border-danger");
    descrizione.classList.add("border-danger");
    dataora.classList.add("border-danger");
  }
};
