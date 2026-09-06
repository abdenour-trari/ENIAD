import { addition, multiplication } from "./operations.js";

let addOrmul = prompt("'M' Pour Multiplication et 'A' pour Addition : ");
addOrmul === "A"
  ? alert("Addition (5 + 3) :" + addition(5, 3).toString())
  : alert("Multiplication (4 * 2) :" + multiplication(4, 2).toString());
