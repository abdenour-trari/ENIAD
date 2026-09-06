const slides = document.querySelectorAll(".slide");
let currentIndex = 0;

document.getElementById("next").onclick = function () {
  slides[currentIndex].classList.remove("active");
  currentIndex < slides.length - 1 ? currentIndex++ : (currentIndex = 0);
  slides[currentIndex].classList.add("active");
};

document.getElementById("prev").onclick = function () {
  slides[currentIndex].classList.remove("active");
  currentIndex <= slides.length ? currentIndex-- : (currentIndex = 0);
  slides[currentIndex].classList.add("active");
};

var x = setInterval(function () {
  slides[currentIndex].classList.remove("active");
  currentIndex < slides.length - 1 ? currentIndex++ : (currentIndex = 0);
  slides[currentIndex].classList.add("active");
}, 2000);
