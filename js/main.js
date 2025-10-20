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

function updateCarousel() {
  if (!isDragging) {
    angle += speed; // rotación automática si no estás arrastrando
  }

  cards.forEach((card, i) => {
    const theta = i * ((2 * Math.PI) / total) + angle;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${theta}rad)`;

    // Mostrar solo las que están al frente
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

// --- eventos sobre el contenedor exterior ---
vrCarousel.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.pageX;
  vrCarousel.style.cursor = "grabbing";
});

vrCarousel.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  currentX = e.pageX;
  const delta = currentX - startX;
  angle += delta * 0.0008; // sensibilidad del arrastre
  startX = currentX;
});

vrCarousel.addEventListener("mouseup", () => {
  isDragging = false;
  vrCarousel.style.cursor = "grab";
});

vrCarousel.addEventListener("mouseleave", () => {
  isDragging = false;
  vrCarousel.style.cursor = "grab";
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

/// Masonry Infinite Scroll
const masonry = document.getElementById("masonry");
const container = document.getElementById("scrollContainer");

const ALTURA_GRANDE = 384;
const ALTURA_PEQUENA = 248;

const arrayContent = [
  {
    title:
      "Terminación de llamadas nacionales e internacionales con precios competitivos y cobertura total",
    img: "./images/test4kv.jpg",
    description: `                  Llega a cualquier destino en el mundo con tarifas accesibles
                  que se ajustan a tus necesidades, sin renunciar a la
                  confiabilidad de una conexión estable y con calidad
                  certificada en cada comunicación. Tanto si tu empresa atiende
                  clientes locales como internacionales, contarás con una
                  infraestructura sólida que asegura la mejor experiencia de
                  voz.`,
  },
  {
    title: `                    Capacidad robusta y alto CPS para Call Centers y grandes
                    volúmenes de llamadas`,
    img: "./images/test4kv.jpg",
    description: `Nuestro servicio está diseñado para soportar picos de tráfico
                  y grandes cantidades de llamadas simultáneas, lo que lo
                  convierte en la solución ideal para centros de contacto,
                  campañas de telemarketing o cualquier operación empresarial
                  que requiera estabilidad a gran escala.`,
  },
  {
    title: `                    Calidad, estabilidad y continuidad operativa garantizada en
                    todo momento`,
    img: "./images/test4kv.jpg",
    description: `                  Con una red redundante y monitoreada de forma constante,
                  aseguramos que tus llamadas mantengan una calidad superior y
                  que tu negocio nunca se vea afectado por interrupciones. La
                  experiencia del usuario final se mantiene fluida y confiable
                  en cada interacción.`,
  },
  {
    title: `Recargas de saldo rápidas y gestión financiera ágil para
                    mantener siempre activa tu operación`,
    img: "./images/test4kv.jpg",
    description: `Administra de forma sencilla el saldo de tus servicios, con
                  procesos de recarga inmediatos que evitan pausas o
                  interrupciones en la comunicación. Mantén la continuidad de
                  tus operaciones sin preocuparte por cortes inesperados.4`,
  },

];

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

function generarCards(cantidadPorColumna = 3) {
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



      const contentDiv = document.createElement("div");
      contentDiv.classList.add("card-content");

      const title = document.createElement("h3");
      title.textContent = content.title;

      //const desc = document.createElement("p");
      //desc.textContent = content.description;

      contentDiv.appendChild(title);
      // contentDiv.appendChild(desc);


      card.appendChild(imageDiv);
      card.appendChild(contentDiv);
      columna.appendChild(card);

      requestAnimationFrame(() => (card.style.opacity = "1"));

      indicePorColumna[c]++;
    }
  }
}

generarCards();

container.addEventListener("scroll", () => {
  if (
    container.scrollTop + container.clientHeight >=
    container.scrollHeight - 50
  ) {
    generarCards(3);
  }
});
