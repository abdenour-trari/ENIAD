/*
var btn = document.getElementById("btn");
var click = 0;
btn.onclick = (affiche) => {
  if (!click) {
    btn.innerHTML = "Clicked";
    click = 1;
  } else {
    btn.innerHTML = "Click me";
    click = 0;
  }
};
  */

// Lambda
fct = (a = 4, b = 9) => {
  document.body.innerHTML = a * b;
};

// fct callBack

var btn = document.getElementById("btn");

btn.onclick = () => {
  let a = parseFloat(prompt("a : "));
  let b = parseFloat(prompt("b : "));

  // Callback function
  let afficher = (arg) => {
    document.body.innerHTML = "La somme est : " + arg;
  };

  mafct(a, b, afficher);
};

function mafct(num1, num2, MyCallBack) {
  let somme = num1 + num2;
  MyCallBack(somme);
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

var btn3 = document.getElementById("btn3");
var a = 1; // Declare outside so it persists

btn3.onclick = () => {
  setInterval(changeColor, 50); // Pass function reference
};

function changeColor() {
  if (a == 1) {
    btn3.style.backgroundColor = "red";
    a = 2;
  } else if (a == 2) {
    btn3.style.backgroundColor = "green";
    a = 3;
  } else {
    btn3.style.backgroundColor = "blue";
    a = 1; // Reset to 1 so it loops
  }
}

// les classes : s
class Voiture {
  constructor(marque, matricule, nomPerson, modele) {
    this.marque = marque;
    this.matricule = matricule;
    this.nomPerson = nomPerson;
    this.modele = modele;
  }

  demarer() {
    return "La voiture démarre";
  }

  rouler() {
    return "La voiture roule";
  }

  afficher() {
    return `
      <br>Marque : ${this.marque}
      <br>Matricule : ${this.matricule}
      <br>Nom du propriétaire : ${this.nomPerson}
      <br>Modèle : ${this.modele}
    `;
  }
}

let btn4 = document.getElementById("btn4");
let para = document.getElementById("para");

btn4.onclick = function () {
  // Affichage des inputs
  para.innerHTML = `
    Matricule : <input type='text' id='mat'><br>
    Marque : <input type='text' id='mar'><br>
    Nom du propriétaire : <input type='text' id='nomPerson'><br>
    Modèle : <input type='text' id='mod'><br>
    <button id='create'>Créer</button>
  `;

  // Attendre le clic sur "Créer"
  document.getElementById("create").onclick = function () {
    let mat = document.getElementById("mat").value;
    let mar = document.getElementById("mar").value;
    let nomPerson = document.getElementById("nomPerson").value;
    let mod = document.getElementById("mod").value;

    let v1 = new Voiture(mar, mat, nomPerson, mod);

    // Affichage des infos + boutons d'action
    para.innerHTML +=
      v1.afficher() +
      `
      <br><button id='btnDemarer'>Démarrer</button>
      <button id='btnRouler'>Rouler</button>
    `;

    // Ajouter actions aux boutons
    document.getElementById("btnDemarer").onclick = function () {
      alert(v1.demarer());
    };

    document.getElementById("btnRouler").onclick = function () {
      alert(v1.rouler());
    };
  };
};
