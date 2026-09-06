function fact(n) {
  if (n <= 1) {
    return 1;
  } else {
    return n * fact(n - 1);
  }
}

let n = prompt("DOnner um nombre : ");
console.log(fact(n));
