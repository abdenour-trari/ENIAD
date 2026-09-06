const changeColor = document.getElementById("changeColor");
const carreRouge = document.getElementById("carreRouge");

changeColor.onclick = function () {
  const colorSelector = document.getElementById("colorSelector").value; // c'est select
  carreRouge.style.backgroundColor = colorSelector;
};

const changeSize = document.getElementById("changeSize");

changeSize.onclick = function () {
  const Longeur = document.getElementById("Longeur").value; // c'est input
  const Largeur = document.getElementById("Largeur").value; // c'est input
  carreRouge.style.width = parseInt(Longeur) + "px";
  carreRouge.style.height = parseInt(Largeur) + "px";
};

const dispaly = document.getElementById("dispaly");
let isViewed = true;
dispaly.onclick = function () {
  if (isViewed) {
    carreRouge.style.opacity = "0";
    isViewed = false;
    dispaly.innerHTML = "Afficher";
  } else {
    carreRouge.style.opacity = "1";
    isViewed = true;
    dispaly.innerHTML = "Cahcer";
  }
};
