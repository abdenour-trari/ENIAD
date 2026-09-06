const Envoyer = document.getElementById("Envoyer");
const form = document.getElementById("form");

form.onsubmit = (e) => {
  e.preventDefault();
};

Envoyer.onclick = () => {
  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const email = document.getElementById("email").value;
  const commentaire = document.getElementById("commentaire").value;

  const span = document.querySelectorAll("span");
  if (!nom) {
    span[0].innerHTML = "Nom est requis";
  } else {
    span[0].innerHTML = "";
  }
  if (!prenom) {
    span[1].innerHTML = "Prenom est requis";
  } else {
    span[1].innerHTML = "";
  }
  if (!email) {
    span[2].innerHTML = "email est requis";
  } else {
    span[2].innerHTML = "";
  }
  if (!commentaire) {
    span[3].innerHTML = "Commentaire est requis";
  } else if (commentaire.length > 50) {
    span[3].innerHTML = "Plus de 50 charcter !!!!";
  } else {
    span[3].innerHTML = "";
  }
};

const commentaireChange = document.getElementById("commentaire");

commentaireChange.addEventListener("input", (e) => {
  if (e.target.value.length > 50) {
    e.target.value = e.target.value.substring(0, 50); // coupe après 50 caractères
    span[3].innerHTML = "Plus de 50 charcter !!!!";
  }
});
