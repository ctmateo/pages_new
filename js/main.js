async function translateText(text, lang) {
  const res = await fetch("/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });

  if (!res.ok) {
    console.error("Error en la petición:", res.status, await res.text());
    return text; // si falla, devuelve el texto original
  }

  const data = await res.json();

  // Verifica que existan traducciones
  if (data.translations && data.translations.length > 0) {
    return data.translations[0].text;
  } else {
    console.error("Respuesta inesperada:", data);
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
const radius = 1100; // distancia desde el centro
const speed = 0.001; // velocidad de rotación
let angle = 0;

function updateCarousel() {
  angle += speed;

  cards.forEach((card, i) => {
    const theta = i * ((2 * Math.PI) / total) + angle;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${theta}rad)`;

    // 🔹 Ocultar las cards que pasan por atrás (z < 0)
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

setTimeout(() => {
  document.getElementById("mouseScroll").classList.add("show");
}, 2000);

// Ocultar cuando se hace scroll
window.addEventListener("scroll", () => {
  const scrollIndicator = document.getElementById("mouseScroll");
  if (window.scrollY > 50) {
    scrollIndicator.style.opacity = "0";
    setTimeout(() => (scrollIndicator.style.display = "none"), 600);
  }
});

