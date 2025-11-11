const LANG_PATHS = {
  ES: "../langs/es_ES.json",
  EN: "../langs/en_EN.json",
};

const params = new URLSearchParams(window.location.search);
const sectionName = params.get("section");
const target = params.get("target") || "";
const lang = params.get("lang")?.toUpperCase() || "EN";

export async function dynamicChangesExpand() {
  try {
    const basePath = "../";
    const path = LANG_PATHS[lang] || LANG_PATHS.ES;

    const response = await fetch(path);
    const translation = await response.json();


    const voiceSection = translation["voice-section"];
    const cardsData = voiceSection["scroller-cards-voice"];

    const voicesProductArray = Object.keys(cardsData.titles).map((key) => {
      const index = parseInt(key);
      return {
        id: `voice-cd-${index}`,
        title: cardsData.titles[key],
        img: basePath + cardsData.images[`img${index}`],
        description: cardsData.desc[`desc${index}`],
      };
    });


    const smsSection = translation["sms-section"];
    const cardDataSms = smsSection["cards"];

    const smsProductArray = Object.entries(cardDataSms).map(([id, title]) => ({
      id,
      title,
    }));


    function createSlider(items, options = {}) {
      const { showImage = true, showDesc = true, containerClass = "" } = options;
      let currentPage = 0;

      const sliderContainer = document.createElement("div");
      sliderContainer.classList.add("slider-container");
      if (containerClass) sliderContainer.classList.add(containerClass);

      items.forEach((item, i) => {
        const slide = document.createElement("div");
        slide.classList.add("slider-item");
        if (i !== 0) slide.classList.add("hidden");

        if (showImage && item.img) {
          const img = document.createElement("img");
          img.src = item.img;
          img.alt = item.title;
          slide.appendChild(img);
        }

        const title = document.createElement("h3");
        title.classList.add("slider-title");
        title.textContent = item.title;
        slide.appendChild(title);

        if (showDesc && item.description) {
          const desc = document.createElement("p");
          desc.textContent = item.description;
          slide.appendChild(desc);
        }

        sliderContainer.appendChild(slide);
      });

      const controls = document.createElement("div");
      controls.classList.add("slider-controls");

      const prevBtn = document.createElement("button");
      prevBtn.textContent = "◀ Anterior";
      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Siguiente ▶";

      controls.append(prevBtn, nextBtn);
      sliderContainer.appendChild(controls);

      function updateSlider() {
        const slides = sliderContainer.querySelectorAll(".slider-item");
        slides.forEach((slide, i) => {
          slide.classList.toggle("hidden", i !== currentPage);
        });
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === items.length - 1;
      }

      nextBtn.addEventListener("click", () => {
        if (currentPage < items.length - 1) {
          currentPage++;
          updateSlider();
        }
      });

      prevBtn.addEventListener("click", () => {
        if (currentPage > 0) {
          currentPage--;
          updateSlider();
        }
      });

      updateSlider();
      return sliderContainer;
    }

    if (sectionName === "service" && target.startsWith("voice")) {
      const section = document.createElement("section");
      section.classList.add(`${sectionName}-expand`);

      const match = voicesProductArray.find((item) => item.id === target);

      if (match) {
        const img = document.createElement("img");
        img.src = match.img;
        img.alt = match.title;

        const title = document.createElement("h3");
        title.classList.add("title-card-scroller");
        title.textContent = match.title;

        const desc = document.createElement("p");
        desc.textContent = match.description;

        section.append(img, title, desc);
        document.body.appendChild(section);
      }
    }

    if (sectionName === "service" && target.startsWith("sms")) {
      const section = document.createElement("section");
      section.classList.add(`${sectionName}-expand`);

      const match = smsProductArray.find((item) => item.id === target);
      if (match) {
        const title = document.createElement("h3");
        title.classList.add("title-card");
        title.textContent = match.title;

        section.append(title);
        document.body.appendChild(section);
      }
    }

    if (sectionName === "service" && target === "voice-features") {
      const slider = createSlider(voicesProductArray, {
        showImage: true,
        showDesc: true,
        containerClass: "voice-slider-container",
      });
      document.body.appendChild(slider);
    }

    if (sectionName === "service" && target === "sms-features") {
      const slider = createSlider(smsProductArray, {
        showImage: false,
        showDesc: false,
        containerClass: "sms-slider-container",
      });
      document.body.appendChild(slider);
    }
  } catch (error) {
    console.error("Error cargando las traducciones:", error);
  }
}
