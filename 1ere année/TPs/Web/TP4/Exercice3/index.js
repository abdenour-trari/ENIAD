let addNumber = document.getElementById("addNumber");
var table = document.getElementById("table");

var id = 1;

addNumber.onclick = () => {
  let addedPhone = document.createElement("tr");
  addedPhone.setAttribute("id", `tr${id}`);
  addedPhone.innerHTML = `
    <td>
      <label for="tele${id}">Telephone :</label>
    </td>
    <td>
      <input type="text" id="tele${id}"> <span class="span"></span>
      <a href='#' id="${id}" class="delete">supprimer</a>
    </td>
  `;
  id++;
  table.append(addedPhone);
};

table.addEventListener("click", (e) => {
  if (e.target && e.target.classList.contains("delete")) {
    var id = e.target.getAttribute("id");
    console.log(id);
    table.removeChild(document.getElementById(`tr${id}`));
  }
});

let send = document.getElementById("send");
send.addEventListener("click", (e) => {
  inputs = table.querySelectorAll("input");
  inputs.forEach((element) => {
    if (element.value === "") {
      element.style.border = "solid red 2px";
      let span = element.nextElementSibling;
      span.innerHTML = "Obligatoir !";
    } else {
      let span = element.nextElementSibling;
      element.style.border = "solid green 2px";
      span.innerHTML = "";
    }
  });
});
