const chargerDonnees = (url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données");
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error.message);
      });
  });
};

async function data() {
  const don = await chargerDonnees("https://v2.jokeapi.dev/joke/Programming");
  console.log(don);
}
