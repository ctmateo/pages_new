const LANG_PATHS = {
  ES: "./langs/es_ES.json",
  EN: "./langs/en_EN.json",
};
let currentLang = "EN";
async function translatePage(lang) {
  currentLang = lang;

  const path = LANG_PATHS[lang];
  if (!path) {
    console.error("Idioma no soportado:", lang);
    return;
  }

  try {
    const response = await fetch(path);
    const translations = await response.json();

    const voiceSection = translations["voice-section"];
    const cardsData = voiceSection["scroller-cards-voice"];

    const arrayContent = Object.keys(cardsData.titles).map((key, i) => ({
      title: cardsData.titles[key],
      img: cardsData.images[`img${i + 1}`],
      description: cardsData.desc[`desc${i + 1}`],
    }));

    generarCards(arrayContent);

    changeNumberFast();
    const elements = document.querySelectorAll("[translate-text]");

    elements.forEach((el) => {
      const key = el.id;
      if (key === "change-text-voice") displazeVerticalText(lang, key);
      if (key === "change-text-sms")
        setTimeout(() => displazeVerticalText(lang, key), 800);
      if (key === "number-callers")
        displazeVerticalText(lang, key, "number-callers");

      const text = findTranslationByKey(translations, key);
      if (text) el.textContent = text;
      else console.warn(`No se encontró traducción para: ${key}`);
    });
  } catch (error) {
    console.error("Error al cargar archivo de idioma:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const languageBtns = document.getElementsByClassName("window");
  translatePage(currentLang);

  for (const btn of languageBtns) {
    btn.addEventListener("click", () => {
      translatePage(currentLang);
    });
  }
});

function findTranslationByKey(obj, key) {
  for (const prop in obj) {
    if (prop === key) {
      return obj[prop];
    }

    if (typeof obj[prop] === "object" && obj[prop] !== null) {
      const found = findTranslationByKey(obj[prop], key);
      if (found) return found;
    }
  }
  return null;
}

async function displazeVerticalText(lang, id, key = "") {
  try {
    const element = document.getElementById(id);
    if (!element) return console.error(`Elemento con id "${id}" no encontrado`);

    if (element._displazeInterval) {
      clearInterval(element._displazeInterval);
      element._displazeInterval = null;
    }

    const path = LANG_PATHS[lang];
    const response = await fetch(path);
    const data = await response.json();

    const section = findTranslationByKey(data, id);
    if (!section)
      return console.error(`No se encontró la sección "${id}" en el JSON`);

    const textArray = Object.values(section);
    let index = 0;
    const lastIndex = textArray.length - 1;

    const SPEED_MAP = {
      "number-callers": 1400,
      "change-text-voice": 2000,
      "change-text-sms": 2000,
    };
    const defaultInterval = 2500;
    const intervalTime = SPEED_MAP[key || id] ?? defaultInterval;

    const removalDelay = Math.min(
      600,
      Math.max(80, Math.floor(intervalTime / 2))
    );

    if (key === "number-callers") {
      element.innerHTML = `<h2 class="active">${textArray[index]}</h2>`;
    } else {
      element.innerHTML = `<span class="active">${textArray[index]}</span>`;
    }

    if (textArray.length <= 1) return;

    element._displazeInterval = setInterval(() => {
      const oldElement =
        key === "number-callers"
          ? element.querySelector("h2")
          : element.querySelector("span");

      if (oldElement) {
        oldElement.classList.replace(
          "active",
          key === "number-callers" ? "fade" : "exit"
        );
      }

      if (key === "number-callers") {
        if (index < lastIndex) {
          index++;
        } else {
          clearInterval(element._displazeInterval);
          element._displazeInterval = null;
          return;
        }
      } else {
        index = (index + 1) % textArray.length;
      }

      const newElement =
        key === "number-callers"
          ? document.createElement("h2")
          : document.createElement("span");
      newElement.textContent = textArray[index];
      element.appendChild(newElement);

      requestAnimationFrame(() => newElement.classList.add("active"));

      setTimeout(() => oldElement?.remove(), removalDelay);

      if (key === "number-callers" && index === lastIndex) {
        clearInterval(element._displazeInterval);
        element._displazeInterval = null;
      }
    }, intervalTime);
  } catch (error) {
    console.error("RUTA DEL ID Y LANG NO DISPONIBLE", error);
  }
}

async function changeNumberFast() {
  const element = document.getElementById("number");
  if (!element) return;
  const elementSufix = document.getElementById("number-callers");

  let i = 0;
  let h1 = element.querySelector("h1");
  if (!h1) {
    h1 = document.createElement("h1");
    h1.classList.add("enter");
    h1.textContent = `+${i}`;
    element.innerHTML = "";
    element.appendChild(h1);
  } else {
    h1.classList.add("enter");
    h1.textContent = `+${i}`;
  }

  const interval = setInterval(() => {
    i++;
    h1.classList.remove("enter");
    h1.classList.add("exit");

    setTimeout(() => {
      h1.textContent = `+${i}`;
      h1.classList.remove("exit");
      void h1.offsetWidth;
      h1.classList.add("enter");
    }, 10);

    if (i >= 100) clearInterval(interval);
  }, 30);
}

const vrCarousel = document.querySelector(".vr-carousel");
const carousel = document.querySelector(".carousel");
const cards = document.querySelectorAll(".card");

if (!vrCarousel || !carousel || cards.length === 0) {
  console.error("Faltan elementos del carrusel en el DOM.");
}

const total = cards.length;
const radius = 1100;
const speed = 0.001;
let angle = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;

// Save previous user-select to restore later
let prevUserSelect = "";
let prevWebkitUserSelect = "";

function disableTextSelection() {
  prevUserSelect = document.body.style.userSelect;
  prevWebkitUserSelect = document.body.style.webkitUserSelect;
  document.body.style.userSelect = "none";
  document.body.style.webkitUserSelect = "none";
}

function restoreTextSelection() {
  document.body.style.userSelect = prevUserSelect;
  document.body.style.webkitUserSelect = prevWebkitUserSelect;
}

function updateCarousel() {
  if (!isDragging) {
    angle += speed;
  }

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

vrCarousel.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.pageX;
  vrCarousel.style.cursor = "grabbing";
  disableTextSelection();
  e.preventDefault();
});

vrCarousel.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  currentX = e.pageX;
  const delta = currentX - startX;
  angle += delta * 0.0008;
  startX = currentX;
  e.preventDefault();
});

vrCarousel.addEventListener("mouseup", () => {
  isDragging = false;
  vrCarousel.style.cursor = "grab";
  restoreTextSelection();
});

vrCarousel.addEventListener("mouseleave", () => {
  isDragging = false;
  vrCarousel.style.cursor = "grab";
  restoreTextSelection();
});

// Prevent native drag behavior (images, etc.)
vrCarousel.addEventListener("dragstart", (e) => {
  e.preventDefault();
});

// Touch support
vrCarousel.addEventListener(
  "touchstart",
  (e) => {
    isDragging = true;
    startX = e.touches[0].pageX;
    vrCarousel.style.cursor = "grabbing";
    disableTextSelection();
    e.preventDefault();
  },
  { passive: false }
);

vrCarousel.addEventListener(
  "touchmove",
  (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].pageX;
    const delta = currentX - startX;
    angle += delta * 0.0008;
    startX = currentX;
    e.preventDefault();
  },
  { passive: false }
);

vrCarousel.addEventListener("touchend", () => {
  isDragging = false;
  vrCarousel.style.cursor = "grab";
  restoreTextSelection();
});

vrCarousel.style.cursor = "grab";

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
      pastPositionScrollY = newPositionScrollY;
    }
    if (window.scrollY > pastPositionScrollY) {
      newPositionScrollY = window.scrollY;

      let timeOut = setTimeout(() => {}, 1000);
      if (timeOut > 1000 && !pastPositionScrollY) {
        scrollIndicator.style.display = "flex";
        document.getElementById("mouseScroll").classList.add("show");
      }
      console.log(newPositionScrollY);
    }
  });
  pastPositionScrollY = newPositionScrollY;
  setTimeout(() => {
    console.log("Past position", pastPositionScrollY);
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
  let cardWidth = originalCards[0].offsetWidth + 30;

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
    const walk = (x - startX) * 0.8;

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
  const svg = object.contentDocument;

  const paths = svg.querySelectorAll("path");
  paths.forEach((path) => {
    path.style.fill = "#5d5d5d";
    path.style.stroke = "#edededff";
    path.style.strokeWidth = "1px";
    path.style.transition = "fill 0.3s ease, stroke 0.3s ease";
    path.style.cursor = "pointer";

    path.addEventListener("mouseenter", function () {
      path.style.fill = "#FF6347";
      path.style.stroke = "#FF4500";
      path.style.strokeWidth = "2px";
    });

    path.addEventListener("mouseleave", function () {
      path.style.fill = "#5d5d5d";
      path.style.stroke = "#edededff";
      path.style.strokeWidth = "1px";
    });
  });
});

const masonry = document.getElementById("masonry");
const ALTURA_GRANDE = 424;
const ALTURA_PEQUENA = 424;

const columnas = [];
for (let i = 0; i < 3; i++) {
  const col = document.createElement("div");
  col.classList.add("columna");
  col.style.display = "flex";
  col.style.flexDirection = "column";
  col.style.flex = "1";
  columnas.push(col);
  masonry.appendChild(col);
}

const patronesColumnas = [
  ["pequena", "grande"],
  ["grande", "pequena"],
  ["pequena", "grande"],
];

let indicePorColumna = [0, 0, 0];
function limpiarMasonry() {
  columnas.forEach((col) => (col.innerHTML = ""));
  indicePorColumna = [0, 0, 0];
}

function generarCards(arrayContent, cantidadPorColumna = 9) {
  limpiarMasonry();
  for (let c = 0; c < 3; c++) {
    const columna = columnas[c];
    const patron = patronesColumnas[c];

    for (let j = 0; j < cantidadPorColumna; j++) {
      const tipo = patron[indicePorColumna[c] % patron.length];
      const altura = tipo === "grande" ? ALTURA_GRANDE : ALTURA_PEQUENA;
      const content =
        arrayContent[(indicePorColumna[c] + j + c) % arrayContent.length];

      const card = document.createElement("div");
      card.classList.add("card");
      card.style.height = `${altura}px`;
      card.style.transition = "opacity 0.5s ease";
      card.style.opacity = "0";

      const imageDiv = document.createElement("div");
      imageDiv.classList.add("card-image");
      imageDiv.style.backgroundImage = `url(${content.img})`;
      imageDiv.style.backgroundSize = "cover";
      imageDiv.style.backgroundPosition = "center";

      const overlay = document.createElement("div");
      overlay.classList.add("overlay");

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("card-content");

      const title = document.createElement("h3");
      title.textContent = content.title;

      const btn = document.createElement("button");
      btn.classList.add("expand-btn-global", "over-image");
      btn.textContent = "Detail feature";

      imageDiv.appendChild(title);

      imageDiv.style.position = "relative";

      overlay.style.position = "absolute";

      overlay.style.zIndex = "2";
      overlay.style.pointerEvents = "none";
      imageDiv.style.pointerEvents ="none";


      btn.style.position = "absolute";
      btn.style.top = "50%";
      btn.style.left = "50%";
      btn.style.transform = "translate(-50%, -50%)";
      btn.style.zIndex = "3";
      btn.style.pointerEvents = "auto";

      imageDiv.appendChild(overlay);
      imageDiv.appendChild(btn);

      card.appendChild(imageDiv);
      card.appendChild(contentDiv);
      columna.appendChild(card);

      requestAnimationFrame(() => (card.style.opacity = "1"));

      indicePorColumna[c]++;
    }
  }
  activeBtnMasonry();
}

function activeBtnMasonry() {
  const cards = document.querySelectorAll(".card");
  const imagecard = document.querySelectorAll(".card-image");

  console.log("Setting up masonry interactions");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", (e) => {
      console.log("clic");
      card.classList.add("active");

      e.stopPropagation();
    });
  });

  cards.forEach((card) => {
    card.addEventListener("mouseleave", () => {
        card.classList.remove("active");

    });
  });
}

function setupDropdowns() {
  const dropdowns = document.querySelectorAll(".drop");

  dropdowns.forEach((drop) => {
    let closeTimeout;

    drop.addEventListener("mouseenter", () => {
      clearTimeout(closeTimeout);
      drop.classList.add("active");
    });

    drop.addEventListener("mouseleave", () => {
      closeTimeout = setTimeout(() => {
        drop.classList.remove("active");
      }, 150);
    });
  });
}

document.addEventListener("DOMContentLoaded", activeBtnMasonry);
document.addEventListener("DOMContentLoaded", setupDropdowns);
