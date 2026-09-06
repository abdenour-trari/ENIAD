// Déclaration de la fonction pour charger les données à partir d'une API
const chargerDonnees = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des données");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const url = "https://jsonplaceholder.typicode.com/posts/1";

chargerDonnees(url)
  .then((data) => console.log("Données chargées :", data))
  .catch((error) => console.error("Erreur :", error));
