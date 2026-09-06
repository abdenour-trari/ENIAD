document
  .getElementById("commentaire")
  .addEventListener("keypress", function (e) {
    const commentaire = this.value;
    if (commentaire.length >= 50) {
      e.preventDefault();
      document.getElementById("errCommentaire").textContent =
        "50 caractères max !";
    } else {
      document.getElementById("errCommentaire").textContent = "";
    }
  });

function validerForm() {
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  const email = document.getElementById("email").value.trim();
  const commentaire = document.getElementById("commentaire").value.trim();

  let valid = true;

  // Reset messages
  document.getElementById("errNom").textContent = "";
  document.getElementById("errPrenom").textContent = "";
  document.getElementById("errEmail").textContent = "";
  document.getElementById("errCommentaire").textContent = "";

  if (!nom) {
    document.getElementById("errNom").textContent = " *Champ requis";
    valid = false;
  }
  if (!prenom) {
    document.getElementById("errPrenom").textContent = " *Champ requis";
    valid = false;
  }
  if (!email) {
    document.getElementById("errEmail").textContent = " *Champ requis";
    valid = false;
  }
  if (!commentaire) {
    document.getElementById("errCommentaire").textContent = " *Champ requis";
    valid = false;
  }

  if (valid) {
    alert("Formulaire envoyé avec succès !");
  }
}
