import { goToRoute } from "./router.js";
import { dynamicChangesExpand } from "./utils/dynamic-expand.js";

let lastClickedId = null;
const LANG_PATHS = {
  ES: "./langs/es_ES.json",
  EN: "./langs/en_EN.json",
};
export let currentLang = "EN";

dynamicChangesExpand();

function eventListener() {
  document.addEventListener("click", (event) => {
    const el = event.target;
    if (!el.id) return;

    if (el.dataset.expandable === "true") {
      setTimeout(() => {
        goToRoute("expand", "products", lastClickedId);
      }, 300);
      console.log(`Clic en elemento expandible: ${el.id}`);
    }

    if (el.dataset.autoScroll === "true" && el.dataset.route) {
      const section = document.querySelector(el.dataset.route);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
    if (el.dataset.openDialog === "true") {
      dialogRecycle(
        el.dataset.title || "",
        el.dataset.img || "",
        el.dataset.description || "",
        el.dataset.nameBtn || "Aceptar",
        parseInt(el.dataset.numberBtn) || 2
      );
    }

    lastClickedId = el.id;
  });
}

eventListener();

function dialogRecycle(isProduction = false) {
  const siteKey = "6LdpdQosAAAAAFqkM9uMMSj3sBZ_0C9YOapvqLmj";
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbx4INsPAjGScae4453Egv84xaJ2HWCivfbsZ19ldXOhDB6laQPS5TuZ1eWRcD2nG_J8/exec";

  if (document.querySelector(".dialog")) return;

  function loadRecaptchaScript(callback) {
    if (window.grecaptcha) {
      callback();
      return;
    }
    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src =
      "https://www.google.com/recaptcha/api.js?onload=onRecaptchaReady&render=explicit";
    script.async = true;
    script.defer = true;
    window.onRecaptchaReady = callback;
    document.body.appendChild(script);
  }

  const dialog = document.createElement("div");
  dialog.classList.add("dialog");

  const overlay = document.createElement("div");
  overlay.classList.add("dialog-overlay");
  overlay.addEventListener("click", () => dialog.remove());

  const content = document.createElement("div");
  content.classList.add("dialog-content");

  const title = document.createElement("h3");
  title.id = "title-dialog";

  title.classList.add("title-dialog");
  title.textContent = "Contáctanos";
  title.setAttribute("translate-text", "");
  const status = document.createElement("p");
  status.id = "status";

  const form = document.createElement("form");
  form.innerHTML = `
  <button type="button" id="cancel-btn"><image src = "./icons/close.svg" /></button>
    <div id ="align-inpt"><input id="inpt2" translate-text type="text" name="name" placeholder="Nombre" required>
    <input id="inpt1" translate-text type="email" name="email" placeholder="Correo electrónico" required></div>
    <textarea id ="area-inpt-msg" translate-text name="msg" placeholder="Solicita información sobre precios, resuelve tus dudas o programa una demostración personalizada." required></textarea>
    <div id="captcha-container"></div>
    <button id="sub-btn" translate-text type="submit">Enviar</button>
  `;
  const subt = document.createElement("p");
  subt.id = "subt-dialog";
  subt.classList.add("subt-dialog");
  subt.setAttribute("translate-text", "");
  subt.textContent =
    "Nuestro equipo de relaciones está listo para atenderte. Puedes solicitar información sobre precios, resolver tus dudas o programar una demostración personalizada para conocer cómo podemos ayudarte a alcanzar tus objetivos.";
  const address = document.createElement("p");
  address.classList.add("subt-dialog");
  address.textContent =
    "Address: 2200 N Commerce Pkwy. Suite 200. Weston, FL 33326, USA - Phone: +1 (954) 372-0969";
  address.id ="ctc-bottom";
  address.setAttribute("translate-text", "");
  address.style.display = "flex";
  address.style.justifyContent = "center";

  content.append(title, subt, form, address, status);
  dialog.append(overlay, content);
  document.body.appendChild(dialog);
  window.translatePage(currentLang);

  form
    .querySelector("#cancel-btn")
    .addEventListener("click", () => dialog.remove());

  loadRecaptchaScript(() => {
    const captchaDiv = document.getElementById("captcha-container");
    if (!captchaDiv.hasAttribute("data-rendered")) {
      grecaptcha.render("captcha-container", { sitekey: siteKey });
      captchaDiv.setAttribute("data-rendered", "true");
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const captchaResponse = grecaptcha.getResponse();
    if (!captchaResponse) {
      status.textContent = "Por favor completa el CAPTCHA";
      return;
    }

    const formData = new FormData(form);
    formData.append("g-recaptcha-response", captchaResponse);

    if (isProduction) {
      console.log("hola");
      fetch(scriptURL, { method: "POST", body: formData })
        .then((res) => res.text())
        .then(() => {
          status.textContent = "Enviado";
          form.reset();
          grecaptcha.reset();
          setTimeout(() => dialog.remove(), 1500);
        })
        .catch((err) => {
          console.error("Error!", err);
          status.textContent = "No se pudimos enviar tu solicitud";
        });
    } else {
      const tempForm = document.createElement("form");
      tempForm.method = "POST";
      tempForm.action = scriptURL;
      tempForm.target = "_blank";

      for (const [key, value] of formData.entries()) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        tempForm.appendChild(input);
      }

      document.body.appendChild(tempForm);
      tempForm.submit();
      document.body.removeChild(tempForm);
      status.textContent = "Enviando tendras respuesta en 3 dias habiles";
    }
  });
}

let translationsCache = {};

window.translatePage = async function translatePage(lang) {
  currentLang = lang;

  try {
    let translations = translationsCache[lang];
    if (!translations) {
      const path = LANG_PATHS[lang];
      if (!path) return console.error("Idioma no disponible:", lang);
      const response = await fetch(path);
      translations = await response.json();
      translationsCache[lang] = translations;
    }

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
      const key = el.getAttribute("translate-text") || el.id;
      const textSection = findTranslationByKey(translations, key);
      if (!textSection)
        return console.warn(`No se encontró traducción para: ${key}`);

      if (key === "change-text-voice")
        displazeVerticalTextWithData(textSection, el);
      else if (key === "change-text-sms")
        setTimeout(() => displazeVerticalTextWithData(textSection, el), 800);
      else if (key === "number-callers")
        displazeVerticalTextWithData(textSection, el);

      else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = textSection;
      }
      else if (el.tagName === "IMG" && el.hasAttribute("alt")) {
        el.alt = textSection;
      }
      else if (el.hasAttribute("title")) {
        el.title = textSection;
      }
      else {
        el.textContent = textSection;
      }
    });
  } catch (error) {
    console.error("Error cargando JSON/Lang:", error);
  }
};

function displazeVerticalTextWithData(sectionData, element) {
  if (element._displazeInterval) {
    clearInterval(element._displazeInterval);
    element._displazeInterval = null;
  }

  element.innerHTML = "";

  const textArray =
    typeof sectionData === "object"
      ? Object.values(sectionData)
      : [sectionData];
  if (textArray.length === 0) return;

  let index = 0;
  const lastIndex = textArray.length - 1;
  const id = element.id;

  const SPEED_MAP = {
    "number-callers": 1400,
    "change-text-voice": 2000,
    "change-text-sms": 2000,
  };
  const intervalTime = SPEED_MAP[id] ?? 2500;
  const removalDelay = Math.min(
    600,
    Math.max(80, Math.floor(intervalTime / 2))
  );
  const tag = id === "number-callers" ? "h2" : "span";

  const firstEl = document.createElement(tag);
  firstEl.textContent = textArray[index];
  firstEl.classList.add("active");
  element.appendChild(firstEl);

  if (textArray.length <= 1) return;

  element._displazeInterval = setInterval(() => {
    const oldEl = element.querySelector(tag);
    if (oldEl)
      oldEl.classList.replace(
        "active",
        id === "number-callers" ? "fade" : "exit"
      );

    if (id === "number-callers") {
      if (index < lastIndex) index++;
      else {
        clearInterval(element._displazeInterval);
        element._displazeInterval = null;
        return;
      }
    } else {
      index = (index + 1) % textArray.length;
    }

    const newEl = document.createElement(tag);
    newEl.textContent = textArray[index];
    element.appendChild(newEl);

    requestAnimationFrame(() => newEl.classList.add("active"));

    setTimeout(() => oldEl?.remove(), removalDelay);

    if (id === "number-callers" && index === lastIndex) {
      clearInterval(element._displazeInterval);
      element._displazeInterval = null;
    }
  }, intervalTime);
}

function findTranslationByKey(obj, key) {
  for (const prop in obj) {
    if (prop === key) return obj[prop];
    if (typeof obj[prop] === "object" && obj[prop] !== null) {
      const found = findTranslationByKey(obj[prop], key);
      if (found) return found;
    }
  }
  return null;
}

translatePage(currentLang);

async function changeNumberFast() {
  const element = document.getElementById("number");
  if (!element) return;
  const elementSufix = document.getElementById("number-callers");

  let i = 0;
  let h1 = element.querySelector("h1");
  if (!h1) {
    h1 = document.createElement("h1");
    h1.classList.add("enter");
    h1.style.fontSize = "48px";
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

vrCarousel.addEventListener("dragstart", (e) => {
  e.preventDefault();
});

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
    }
  });
  pastPositionScrollY = newPositionScrollY;
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
  let isDragging = false;
  let startX;
  let scrollLeft;
  const cardWidth = originalCards[0].offsetWidth + 30;

  wrapper.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
    wrapper.style.cursor = "grabbing";
  });

  wrapper.addEventListener("mouseleave", stopDragging);
  wrapper.addEventListener("mouseup", stopDragging);

  wrapper.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();

    const x = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 0.8;

    if (Math.abs(walk) > 5) isDragging = true;

    wrapper.scrollLeft = scrollLeft - walk;
    adjustInfiniteScroll();
  });

  wrapper.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
  });

  wrapper.addEventListener("touchend", stopDragging);

  wrapper.addEventListener("touchmove", (e) => {
    if (!isDown) return;

    const x = e.touches[0].pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 1.4;

    if (Math.abs(walk) > 5) isDragging = true;

    wrapper.scrollLeft = scrollLeft - walk;
    adjustInfiniteScroll();
  });

  wrapper.addEventListener("click", (e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;
    }
  });

  function stopDragging() {
    if (isDown) snapToNextCard();
    isDown = false;
    isDragging = false;
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
const ALTURA_GRANDE = 374;
const ALTURA_PEQUENA = 374;

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

let indiceGlobal = 0;

function generarCards(arrayContent, cantidadPorColumna = 3) {
  limpiarMasonry();

  const totalFilas = 3;
  let indiceGlobal = 0;

  for (let fila = 0; fila < totalFilas; fila++) {
    for (let c = 0; c < cantidadPorColumna; c++) {
      const columna = columnas[c];
      const patron = patronesColumnas[c];
      const tipo = patron[indicePorColumna[c] % patron.length];
      const altura = tipo === "grande" ? ALTURA_GRANDE : ALTURA_PEQUENA;

      const content = arrayContent[indiceGlobal % arrayContent.length];
      indiceGlobal++;

      const card = document.createElement("div");
      card.classList.add("card");
      card.id = `voice-cd-${indiceGlobal}`;
      card.dataset.expandable = "true";
      card.style.height = `${altura}px`;
      card.style.transition = "opacity 0.5s ease";
      card.style.opacity = "0";

      const imageDiv = document.createElement("div");
      imageDiv.classList.add("card-image");

      imageDiv.style.backgroundImage = `url(${content.img})`;
      imageDiv.style.backgroundSize = "cover";
      imageDiv.style.backgroundPosition = "center";
      imageDiv.style.position = "relative";
      imageDiv.style.pointerEvents = "none";

      const overlay = document.createElement("div");
      overlay.classList.add("overlay");
      overlay.style.position = "absolute";
      overlay.style.pointerEvents = "none";

      const title = document.createElement("h3");
      title.classList.add("title-card-scroller");
      title.textContent = content.title;
      title.style.position = "absolute";
      title.style.zIndex = "4";

      const btn = document.createElement("button");
      btn.classList.add("expand-btn-global", "over-image");
      btn.textContent = "Select to expand";
      btn.style.position = "absolute";
      btn.style.top = "20px";
      btn.style.right = "20px";
      btn.style.zIndex = "3";
      btn.style.pointerEvents = "auto";

      imageDiv.appendChild(title);
      imageDiv.appendChild(overlay);
      imageDiv.appendChild(btn);

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("card-content");

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
eventListener();
