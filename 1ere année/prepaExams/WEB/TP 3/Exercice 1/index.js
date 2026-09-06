const Voiture = [
  {
    Immatriculation: "48-A-20000",
    Marque: "Clio 3",
    Couleur: "Noir",
    Carburant: "Diesel",
    Prix_Jour: "250",
  },
  {
    Immatriculation: "48-A-20001",
    Marque: "Clio 4",
    Couleur: "Rouge",
    Carburant: "Diesel",
    Prix_Jour: "300",
  },
  {
    Immatriculation: "48-A-20002",
    Marque: "Dacia",
    Couleur: "Noir",
    Carburant: "Essence",
    Prix_Jour: "200",
  },
];
const tbody = document.getElementById("tbody");

const getAllCars = () => {
  Voiture.forEach((voiture, index) => {
    const tr = document.createElement("tr");
    const td_Imm = document.createElement("td");
    const td_Ma = document.createElement("td");
    const td_Cou = document.createElement("td");
    const td_Car = document.createElement("td");
    const td_PriJ = document.createElement("td");
    const td_Delete = document.createElement("td");

    td_Imm.innerHTML = voiture.Immatriculation;
    td_Ma.innerHTML = voiture.Marque;
    td_Cou.innerHTML = voiture.Couleur;
    td_Car.innerHTML = voiture.Carburant;
    td_PriJ.innerHTML = voiture.Prix_Jour;
    td_Delete.innerHTML = `<button class='btn' onclick='deleteVoiture()'>Supprimer</button>`;

    tr.appendChild(td_Imm);
    tr.appendChild(td_Ma);
    tr.appendChild(td_Cou);
    tr.appendChild(td_Car);
    tr.appendChild(td_PriJ);
    tr.appendChild(td_Delete);

    tr.setAttribute("data-index", index);

    tbody.append(tr);
  });
};

const deleteVoiture = () => {
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.forEach((row, index) => {
    const btn = row.querySelector("button");

    if (event.target === btn) {
      Voiture.splice(index, 1);
    }
  });
  tbody.innerHTML = "";
  getAllCars();
};

getAllCars();

const getCar = (marque) => {
  tbody.innerHTML = "";

  for (const v of Voiture) {
    if (v.Marque.toString().includes(marque.toString())) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.Immatriculation}</td>
        <td>${v.Marque}</td>
        <td>${v.Carburant}</td>
        <td>${v.Carburant}</td>
        <td>${v.Prix_Jour}</td>
        <td><button class='btn'  onclick='deleteVoiture()'>Supprimer</button></td>
      `;
      tbody.appendChild(tr);
    }
  }
};

const Filter = document.getElementById("Filter");
const searchedCar = document.getElementById("searchedCar");

Filter.onclick = function () {
  getCar(searchedCar.value);
  searchedCar.textContent = "";
};
