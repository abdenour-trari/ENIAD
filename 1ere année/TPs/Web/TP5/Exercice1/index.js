let T_Voitures = [
  {
    immatriculation: "48-A-20000",
    marque: "Clio 3",
    couleur: "Noir",
    carburant: "Diesel",
    prix_jour: 250,
  },
  {
    immatriculation: "48-A-20001",
    marque: "Clio 4",
    couleur: "Rouge",
    carburant: "Diesel",
    prix_jour: 300,
  },
  {
    immatriculation: "48-A-20002",
    marque: "Dacia",
    couleur: "Noir",
    carburant: "Essence",
    prix_jour: 200,
  },
];

function afficherVoitures(voitures) {
  const tbody = document.querySelector("#voitureTable tbody");
  tbody.innerHTML = "";
  voitures.forEach((v) => {
    let row = `<tr>
        <td>${v.immatriculation}</td>
        <td>${v.marque}</td>
        <td>${v.couleur}</td>
        <td>${v.carburant}</td>
        <td>${v.prix_jour}</td>
        <td><button onclick="deleteVoiture('${v.immatriculation}')">Supprimer</button></td>
      </tr>`;
    tbody.innerHTML += row;
  });
}

function getAllVoitures() {
  afficherVoitures(T_Voitures);
}

function deleteVoiture(immat) {
  T_Voitures = T_Voitures.filter((v) => v.immatriculation !== immat);
  getAllVoitures();
}

function getVoitures() {
  const marque = document.getElementById("filterMarque").value.toLowerCase();
  const filtered = T_Voitures.filter((v) =>
    v.marque.toLowerCase().includes(marque)
  );
  afficherVoitures(filtered);
}

getAllVoitures();
