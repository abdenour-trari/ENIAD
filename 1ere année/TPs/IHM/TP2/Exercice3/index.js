class Voiture {
  constructor(marque, modele, immatriculation) {
    this.marque = marque;
    this.modele = modele;
    this.immatriculation = immatriculation;
  }

  afficherInfo() {
    return `Voiture: ${this.marque} ${this.modele}, Immatriculation: ${this.immatriculation}`;
  }
}

class Parking {
  constructor(nom, capacite) {
    this.nom = nom;
    this.capacite = capacite;
    this.voitures = [];
  }

  ajouterVoiture(voiture) {
    if (this.voitures.length < this.capacite) {
      this.voitures.push(voiture);
      //voiture.splice
      console.log(`Voiture ajoutée: ${voiture.afficherInfo()}`);
    } else {
      console.log("Parking plein, impossible d'ajouter la voiture.");
    }
  }

  supprimerVoiture(immatriculation) {
    this.voitures = this.voitures.filter(
      (v) => v.immatriculation !== immatriculation
    );
    console.log(`Voiture avec immatriculation ${immatriculation} supprimée.`);
  }

  afficherParking() {
    console.log("Liste des voitures dans le parking :");
    this.voitures.forEach((v) => console.log(v.afficherInfo()));
  }
}

// Tester les classes
const voiture1 = new Voiture("Toyota", "Corolla", "AB-123-CD");
const voiture2 = new Voiture("Tesla", "Model S", "XY-789-ZT");

const monParking = new Parking("Parking Central", 2);
monParking.ajouterVoiture(voiture1);
monParking.ajouterVoiture(voiture2);
monParking.afficherParking();

monParking.supprimerVoiture("AB-123-CD");
monParking.afficherParking();
