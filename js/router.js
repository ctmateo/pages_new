export const routes = {
  expand: "/pages/expand-window.html",
  index: "/index.html"
};

let pageTitleMap = {
  "/pages/expand-window.html": "Expanding",
  "/pages/about-us.html": "About Us | AlkaIP Telecom, WholeSale VoIP and TDM Termination"
};

const currentPath = window.location.pathname;
document.title =
  pageTitleMap[currentPath] ||
  "AlkaIP Telecom, WholeSale VoIP and TDM Termination";

export function goToRoute(
  route = "",
  dinamycPath = "",
  id = "",
  lang = "EN",
  lastId = ""
) {
  const target = routes[route];
  if (!target) {
    console.warn(`Ruta no válida: ${route}`);
    return;
  }

  let url = target;
  const encodedId = id ? encodeURIComponent(id) : "";

  if (route === "expand") {
    switch (dinamycPath) {
      case "products":
        url += `?section=service`;
        if (encodedId) url += `&target=${encodedId}&id=${lastId}`;
        break;

      case "about-us":
        url += "?section=aboutus";
        if (encodedId) url += `&target=${encodedId}&id=${"service"}`;
        break;

      default:
        break;
    }
  }

  url += (url.includes("?") ? "&" : "?") + `lang=${lang}`;

  console.log(url);
  window.location.href = url;
}
