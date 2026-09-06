var modifyColor = document.getElementById("modifyColor");
var select = document.getElementById("select");
var carre = document.getElementById("carre");

modifyColor.onclick = function () {
  carre.style.backgroundColor = select.value;
};

var modifySize = document.getElementById("modifySize");
modifySize.onclick = function () {
  carre.style.width = document.getElementById("Longeur").value + "px";
  carre.style.height = document.getElementById("Largeur").value + "px";
};

var cacher = document.getElementById("cacher");
var cache = true;

cacher.onclick = function () {
  if (cache) {
    cacher.innerHTML = "Afficher";
    carre.style.opacity = 0;
  } else {
    cacher.innerHTML = "Cacher";
    carre.style.opacity = 1;
  }
  cache = !cache;
};
