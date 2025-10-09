async function translateText(text, lang) {
  const res = await fetch("/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });

  if (!res.ok) {
    return text;
  }

  const data = await res.json();

  if (data.translations && data.translations.length > 0) {
    return data.translations[0].text;
  } else {
    return text;
  }
}

async function translatePage(lang) {
  const elements = document.querySelectorAll("[translate-text]");
  for (let element of elements) {
    const text = element.innerText;
    const translated = await translateText(text, lang);
    element.innerText = translated;
  }
}

const carousel = document.querySelector(".carousel");
const cards = document.querySelectorAll(".card");
const total = cards.length;
const radius = 1100;
const speed = 0.001;
let angle = 0;

function updateCarousel() {
  angle += speed;

  cards.forEach((card, i) => {
    const theta = i * ((2 * Math.PI) / total) + angle;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${theta}rad)`;

    if (z > 0) {
      card.style.opacity = 0;
      card.style.pointerEvents = "none";
    } else {
      card.style.opacity = 1;
      card.style.pointerEvents = "auto";
    }
  });

  requestAnimationFrame(updateCarousel);
}

updateCarousel();

function waitMouseScroller() {
  let checkObserver = 0;
  const scrollIndicator = document.getElementById("mouseScroll");
  let pastPositionScrollY = window.screenY;
  let newPositionScrollY = 0;

  setTimeout(() => {
    document.getElementById("mouseScroll").classList.add("show");
  }, 1000);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      scrollIndicator.style.opacity = "0";
      setTimeout(() => (scrollIndicator.style.display = "none"), 600);
      newPositionScrollY = window.scrollY;
    }

    console.log("nueva posicion", newPositionScrollY);
  });
  pastPositionScrollY = newPositionScrollY;
  setTimeout(() => {
    console.log("posicion pasada", pastPositionScrollY);
  }, 250);
}

waitMouseScroller();
document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("cardsWrapper");
  if (!wrapper) return;

  const originalCards = Array.from(wrapper.children);
  const cloneStart = originalCards.map((c) => c.cloneNode(true));
  const cloneEnd = originalCards.map((c) => c.cloneNode(true));
  wrapper.prepend(...cloneStart);
  wrapper.append(...cloneEnd);

  const sectionWidth = wrapper.scrollWidth / 3;
  wrapper.scrollLeft = sectionWidth;

  let isDown = false;
  let startX;
  let scrollLeft;
  let cardWidth = originalCards[0].offsetWidth + 30; // ancho + gap

  wrapper.addEventListener("mousedown", (e) => {
    isDown = true;
    wrapper.style.cursor = "grabbing";
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
  });

  wrapper.addEventListener("mouseleave", () => stopDragging());
  wrapper.addEventListener("mouseup", () => stopDragging());

  wrapper.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 0.8; // sensibilidad

    if (walk > 0) return;

    wrapper.scrollLeft = scrollLeft - walk;
    adjustInfiniteScroll();
  });

  wrapper.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
  });

  wrapper.addEventListener("touchend", () => stopDragging());

  wrapper.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 1.4;
    if (walk > 0) return;
    wrapper.scrollLeft = scrollLeft - walk;
    adjustInfiniteScroll();
  });

  function stopDragging() {
    if (isDown) snapToNextCard();
    isDown = false;
    wrapper.style.cursor = "grab";
  }

  function adjustInfiniteScroll() {
    const maxScroll = sectionWidth * 2;
    const minScroll = 1;

    if (wrapper.scrollLeft <= minScroll + 10) {
      wrapper.scrollLeft += sectionWidth;
    } else if (wrapper.scrollLeft >= maxScroll - 10) {
      wrapper.scrollLeft -= sectionWidth;
    }
  }

  function snapToNextCard() {
    const current = wrapper.scrollLeft;
    const next = Math.ceil(current / cardWidth) * cardWidth;
    wrapper.scrollTo({
      left: next,
      behavior: "smooth",
    });
  }
});

const object = document.querySelector(".dinamyc-map");

object.addEventListener("load", function () {
  const svg = object.contentDocument; // Accedemos al contenido del SVG

  const paths = svg.querySelectorAll("path");
  paths.forEach((path) => {
    // Configuramos los estilos iniciales
    path.style.fill = "#4A90E2"; // Color inicial
    path.style.stroke = "#333"; // Contorno inicial (color gris oscuro)
    path.style.strokeWidth = "1px"; // Grosor del contorno
    path.style.transition = "fill 0.3s ease, stroke 0.3s ease"; // Transición suave
    path.style.cursor = "pointer"; // Cambiar el cursor a pointer

    // Evento para cuando el mouse entra (hover)
    path.addEventListener("mouseenter", function () {
      path.style.fill = "#FF6347"; // Cambio de color al pasar el mouse
      path.style.stroke = "#FF4500"; // Cambio del contorno al pasar el mouse
      path.style.strokeWidth = "2px"; // Aumentamos el grosor del contorno
    });

    // Evento para cuando el mouse sale (deja de hacer hover)
    path.addEventListener("mouseleave", function () {
      path.style.fill = "#4A90E2"; // Restauramos el color original
      path.style.stroke = "#333"; // Restauramos el contorno original
      path.style.strokeWidth = "1px"; // Restauramos elP
      //  grosor del contorno
    });
  });
});
