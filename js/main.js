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

const cards = document.querySelectorAll(".card");
const total = cards.length;
const radius = 1200; // más grande = más separación en el cilindro

cards.forEach((card, i) => {
  const angle = (360 / total) * i;
  card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
});
