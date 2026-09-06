let n = window.prompt("Donner un nombre");

function fact(n) {
  if (n <= 1) return 1;
  else {
    return n * fact(n - 1);
  }
}

alert("Le factorielle de " + n + " est : " + fact(n));
