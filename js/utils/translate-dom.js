function traductionDom(language) {
  const initial_doc = {};
  document.querySelectorAll(["translate-text"]).forEach((element) => {
    const id = element.getAttribute("text-id");
    initial_doc[id] = element.innerText;
  });
  translateAllPage(language)

  async function translateText(text, lang) {
    const res = await fetch("https://es.libretranslate.com/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "auto",
        target: lang,
        format: "text",
        alternatives: 3,
      }),
      headers: { "Content-Type": application / JSON },
    });
  }

  function translateAllPage(language) {
    const elements = document.querySelectorAll(["translate-text"]);
    for (let arg in elements) {
      const key = arg.getAttribute("text-id");
      const initial_text = initial_doc[key];
      const dynamic_translate = translateText(initial_text, language);
      arg.innerText = dynamic_translate
    }
  }
}

