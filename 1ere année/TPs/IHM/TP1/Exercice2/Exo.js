let func1 = (x) => {
  return x + 5;
};

let func2 = (x, y) => {
  return x + y;
};

let func3 = () => {
  let num1 = parseInt(prompt("Donner le 1er nombre : "));
  let num2 = parseInt(prompt("Donner le 2eme nombre : "));
  return num1 + num2;
};
document.write("<p>La 1ere fonction : func1(5) : " + func1(5) + "</p>");
document.write("<p>La 2eme fonction : func2(5,10) : " + func2(5, 10) + "</p>");
document.write("<p>La 2eme fonction : func2(5,10) : " + func3() + "</p>");
