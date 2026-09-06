const numbers = [3, 8, 1, 12, 7, 5, 5, 3];

findMax = (tab) => {
  var max = tab[0];
  for (let i = 1; i < tab.length; i++) {
    if (tab[i] > max) {
      max = tab[i];
    }
  }

  return max;
};

sumArray = (tab) => {
  var sum = 0;
  for (let i = 0; i < tab.length; i++) {
    sum += tab[i];
  }

  return sum;
};

countOccurrences = (tab, value) => {
  var occ = 0;
  for (let i = 0; i < tab.length; i++) {
    if (tab[i] === value) {
      occ++;
    }
  }

  return occ;
};

const removeDuplicates = (tab) => {
  let newArr = []; // 🔴 Déclarer newArr correctement

  for (let i = 0; i < tab.length; i++) {
    let isDuplicate = false;

    for (let j = 0; j < newArr.length; j++) {
      if (tab[i] === newArr[j]) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      newArr.push(tab[i]);
    }
  }

  return newArr;
};

const tab = [1, 2, 3, 4, 5];

const personnes = [
  { prenom: "Ahmed", nom: "ALAMI" },
  { prenom: "Fatima", nom: "ALAOUI" },
  { prenom: "Karim", nom: "BAGHDADI" },
];

const newTab = tab.map((num) => num * 2);

const fullName = personnes.map((name) => name.prenom + " " + name.nom);

const paire = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const nmrPaire = paire.filter((num) => num % 2 === 0);

const alphabet = ["a", "b", "c", "a", "b", "a", "c", "d"];

const rep = alphabet.reduce((acc, value) => {
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

console.log(rep);
