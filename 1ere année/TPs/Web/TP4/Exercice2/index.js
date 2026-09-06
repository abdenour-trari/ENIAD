const btnLeft = document.getElementById("btnLeft");
const btnRight = document.getElementById("btnRight");
const carousel = document.getElementById("carousel");

let currentIndex = 0;
const totalImages = carousel.querySelectorAll("img").length;
const images = carousel.querySelectorAll("img");
const imageWidth = images[0].offsetWidth;
btnRight.onclick = function () {
  if (currentIndex < totalImages - 1) {
    currentIndex++;
    updateCarousel();
  }
};

btnLeft.onclick = function () {
  if (currentIndex > 0) {
    currentIndex--;
    updateCarousel();
  }
};
function updateCarousel() {
  carousel.style.transition = "transform 0.5s ease";
  carousel.style.transform = `translateX(-${currentIndex * imageWidth}px)`;
}

setInterval(() => {
  currentIndex++;

  updateCarousel();

  if (currentIndex === images.length) {
    setTimeout(() => {
      carousel.style.transition = "none";
      currentIndex = 0;
      carousel.style.transform = `translateX(0px)`;
    }, 1000);
  }
}, 2000);
