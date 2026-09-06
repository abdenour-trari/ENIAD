var jsonData = '{"nom":"Saidi", "prenom":"Ali"}';
console.log(typeof jsonData);

// Conversion JSON → Objet JavaScript
var jsObject = JSON.parse(jsonData);
console.log(typeof jsObject); // object
console.log(jsObject.nom + " " + jsObject.prenom); // Saidi Ali

// Création d'un objet JavaScript
var jsObject2 = { nom: "Saidi", prenom: "Ali" };
console.log(typeof jsObject2); // object

// Conversion Objet JavaScript → JSON
var jsonString = JSON.stringify(jsObject2);
console.log(typeof jsonString); // string
console.log(jsonString); // {"nom":"Saidi","prenom":"Ali"}
