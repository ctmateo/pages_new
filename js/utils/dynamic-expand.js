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
      const {
        showImage = true,
        showDesc = true,
        containerClass = "",
        autoPlay = true,
        autoPlayDelay = 3,
        startIndex = 0,
      } = options;
      let currentPage = startIndex; // 👈 Antes estaba en 0
      let interval;
      let countdown = autoPlayDelay;

      const sliderContainer = document.createElement("div");
      sliderContainer.classList.add("slider-container");
      if (containerClass) sliderContainer.classList.add(containerClass);

      // === HEADER SUPERIOR ===
      const topBar = document.createElement("div");
      topBar.classList.add("slider-top-bar");

      const backBtn = document.createElement("div");
      backBtn.classList.add("back-btn");

      const iconBkBtn = document.createElement("img");
      iconBkBtn.src = "../icons/arrow-bk.svg";
      const txtBkBtn = document.createElement("p");
      txtBkBtn.textContent = "Back to home";
      backBtn.append(iconBkBtn, txtBkBtn);

      backBtn.addEventListener("click", () => {
        window.location.href = "../index.html";
      });
      const indicators = document.createElement("div");
      indicators.classList.add("slider-indicators");

      const timer = document.createElement("div");
      timer.classList.add("slider-timer");
      timer.textContent = `Manual`;

      topBar.append(backBtn, indicators, timer);
      sliderContainer.appendChild(topBar);
      let indexCurrent = 0;
      // === SLIDES ===
      items.forEach((item, i) => {
        indexCurrent = i;
        const slide = document.createElement("div");
        slide.classList.add("slider-item");
        if (i !== 0) slide.classList.add("hidden");

        if (showImage && item.img) {
          const img = document.createElement("img");
          img.classList.add("image-contain");
          img.src = item.img;
          img.alt = item.title;
          slide.appendChild(img);
        }

        const content = document.createElement("div");
        content.classList.add("slider-content");

        const title = document.createElement("h3");
        title.classList.add("slider-title");
        title.textContent = item.title;
        content.appendChild(title);

        if (showDesc && item.description) {
          const desc = document.createElement("p");
          desc.textContent = item.description;
          content.appendChild(desc);
        }

        slide.appendChild(content);
        sliderContainer.appendChild(slide);

        // crear punto indicador
        const dot = document.createElement("span");
        dot.classList.add("indicator-dot");
        if (i === 0) dot.classList.add("active");
        indicators.appendChild(dot);
      });

      // === CONTROLES INFERIORES ===
      const controls = document.createElement("div");
      controls.classList.add("slider-controls");

      const prevBtn = document.createElement("button");
      prevBtn.textContent = "Anterior";
      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Siguiente";

      controls.append(prevBtn, nextBtn);
      sliderContainer.appendChild(controls);

      // === FUNCIONES ===
      function updateSlider() {
        const slides = sliderContainer.querySelectorAll(".slider-item");
        const dots = sliderContainer.querySelectorAll(".indicator-dot");

        slides.forEach((slide, i) => {
          slide.classList.toggle("hidden", i !== currentPage);
        });

        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === currentPage);
        });

        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === items.length - 1;
      }

      function startAutoPlay() {
        if (!autoPlay) return;
        clearInterval(interval);
        interval = setInterval(() => {
          countdown--;
          timer.textContent = `Next article in ${countdown}`;
          if (countdown <= 0) {
            countdown = autoPlayDelay;
            if (items.length - 1 === currentPage) {
              for (let index = 0; index < items.length; index++) {
                prevBtn.click();
              }
            } else {
              nextBtn.click();
            }
          }
        }, 1000);
      }

      function resetAutoPlay() {
        countdown = autoPlayDelay;
        startAutoPlay();
      }

      nextBtn.addEventListener("click", () => {
        if (currentPage < items.length - 1) {
          currentPage++;
        } else {
          currentPage = 0;
        }
        updateSlider();
        resetAutoPlay();
      });

      prevBtn.addEventListener("click", () => {
        if (currentPage > 0) {
          currentPage--;
        } else {
          currentPage = items.length - 1;
        }
        updateSlider();
        resetAutoPlay();
      });

      updateSlider();
      startAutoPlay();
      return sliderContainer;
    }

    if (
      sectionName === "service" &&
      target.startsWith("voice") &&
      target !== "voice-features"
    ) {
      const indexTarget = voicesProductArray.findIndex(
        (item) => item.id === target
      );

      if (indexTarget !== -1) {
        const slider = createSlider(voicesProductArray, {
          showImage: true,
          showDesc: true,
          autoPlay: false,
          containerClass: "voice-slider-container",
          startIndex: indexTarget,
        });

        document.body.appendChild(slider);
      }
    }

    if (
      sectionName === "service" &&
      target.startsWith("sms") &&
      target !== "sms-features"
    ) {
      const indexTarget = smsProductArray.findIndex(
        (item) => item.id === target
      );

      if (indexTarget !== -1) {
        const slider = createSlider(smsProductArray, {
          showImage: false,
          showDesc: false,
          autoPlay: false,
          containerClass: "sms-slider-container",
          startIndex: indexTarget,
        });

        document.body.appendChild(slider);
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
