let add = document.getElementById("add");
let del = document.getElementById("del");
let ul = document.getElementById("ul");
let body = document.body;

add.onclick = () => {
  if (document.getElementById("input").value !== "") {
    let li = document.createElement("li");
    li.className = "li";
    li.textContent = document.getElementById("input").value;
    ul.append(li);
    document.getElementById("input").value = "";
  }
};

body.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && document.getElementById("input").value !== "") {
    let li = document.createElement("li");
    li.className = "li";
    li.textContent = document.getElementById("input").value;
    ul.append(li);
    document.getElementById("input").value = "";
  }
});

ul.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    e.target.style.backgroundColor = "green";
    e.target.classList.toggle("selected");
  }
});

del.onclick = () => {
  if (confirm("vous etes sur de supprimer ces elements ? ")) {
    selectedItems = ul.querySelectorAll(".selected");
    selectedItems.forEach((element) => {
      ul.removeChild(element);
    });
  }
};

let toggleAll = document.getElementById("toggleAll");

toggleAll.onclick = () => {
  let allItems = ul.querySelectorAll("li");
  allItems.forEach((item) => {
    item.classList.toggle("selected");
    item.style.backgroundColor = item.classList.contains("selected")
      ? "green"
      : "";
  });
};
