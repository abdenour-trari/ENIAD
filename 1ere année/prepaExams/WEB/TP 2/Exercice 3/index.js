const addPhone = document.getElementById("addPhone");
const form = document.getElementById("form");
const tbody = document.getElementById("tbody");

let i = tbody.querySelectorAll("tr").length + 1;

form.addEventListener("submit", function (e) {
  e.preventDefault(); // bloque l'envoi pour test
});

// Ajouter un nouveau champ téléphone
addPhone.addEventListener("click", () => {
  const tr = document.createElement("tr");
  const td_label = document.createElement("td");
  const td_input = document.createElement("td");

  tr.setAttribute("data-id", i);

  td_label.innerHTML = `<label for='tele${i}'>Téléphone :</label>`;
  td_input.innerHTML = `
    <input type="text" id="tele${i}"/>
    <a href="#" class="delete-link" data-id='${i}'>Supprimer</a>
    <span id="teleS${i}"></span>
  `;

  tr.appendChild(td_label);
  tr.appendChild(td_input);
  tbody.appendChild(tr);
  i++;
});

// Délégation d'événement pour supprimer dynamiquement
tbody.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete-link")) {
    e.preventDefault();
    const id = e.target.dataset.id;
    const tr = tbody.querySelector(`tr[data-id="${id}"]`);
    tbody.removeChild(tr);
  }
});

// vérification
const handleClick = () => {
  const nomS = document.getElementById("nom");
  const prenomS = document.getElementById("prenom");
  const teleS = document.getElementById("telephone0");

  var span = document.querySelectorAll("span");
  if (!nomS.value) {
    span[0].innerHTML = "Ce champs est requis !";
    nomS.style.border = "solid 1px red";
  } else {
    span[0].innerHTML = "";
    nomS.style.border = "solid 1px green";
  }
  if (!prenomS.value) {
    span[1].innerHTML = "Ce champs est requis !";
    prenomS.style.border = "solid 1px red";
  } else {
    span[1].innerHTML = "";
    prenomS.style.border = "solid 1px green";
  }
  if (!teleS.value) {
    span[2].innerHTML = "Ce champs est requis !";
    teleS.style.border = "solid 1px red";
  } else {
    span[2].innerHTML = "";
    teleS.style.border = "solid 1px green";
  }
  for (let j = 1; j <= i; j++) {
    if (!document.getElementById(`tele${j}`).value) {
      document.getElementById(`teleS${j}`).innerHTML = "Ce champs est requis !";
      document.getElementById(`tele${j}`).style.border = "solid 1px red";
    } else {
      document.getElementById(`teleS${j}`).innerHTML = "";
      document.getElementById(`tele${j}`).style.border = "solid 1px green";
    }
  }
};
