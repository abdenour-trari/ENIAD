// Qt 1 :
let doubleTableau = (nombres) => {
  let doubles = nombres.map((nombre) => nombre * 2);
  return doubles;
};

document.write(
  "<h3>Double des nombres </h3>" +
    doubleTableau([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) +
    "<br>"
);
// ++++++++++++++++++++++++++++++++++++++++++++++++

// Qt 2 :

const personnes = [
  { prenom: "Ahmed", nom: "ALAMI" },
  { prenom: "Fatima", nom: "ALAOUI" },
  { prenom: "Karim", nom: "BAGHDADI" },
];

let stringTable = (objectTable) => {
  let nomComplet = objectTable.map(
    (person) => person.prenom + " " + person.nom + "<br>"
  );
  return nomComplet;
};

document.write("<h3>Affichage des noms  </h3>" + stringTable(personnes));

// ++++++++++++++++++++++++++++++++++++++++++++++++

// Qt 3

let nombresPaires = (arr) => {
  let newTable = arr.filter((element) => {
    return element % 2 == 0;
  });

  return newTable;
};

document.write(
  "<h3>Les nombres pairs </h3>" + nombresPaires([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
);

// ++++++++++++++++++++++++++++++++++++++++++++++++

// Qt 4

let calcFrequence = (arr) => {
  let newTable = arr.reduce((accumulateur, element) => {
    accumulateur[element] = (accumulateur[element] || 0) + 1;
    return accumulateur;
  }, {});
  return newTable;
};

document.write(
  "<h3>Nombre de repetition </h3>" +
    JSON.stringify(calcFrequence(["a", "b", "c", "a"]))
);

// ++++++++++++++++++++++++++++++++++++++++++++++++
