export const routes = {
  expand: "../pages/expand-window.html",
  loading: "../pages/loading.html",
  alert: "../pages/alert-dialog.html",
};

const pageTitleMap = {
  "/pages/expand-window.html": "Expand",
  "/pages/loading.html": "Loading",
  "/pages/alert-dialog.html": "Alert",
};

const currentPath = window.location.pathname;
document.title =
  pageTitleMap[currentPath] ||
  "AlkaIP Telecom, WholeSale VoIP and TDM Termination";

export function goToRoute(route = "", dinamycPath = "", id = "", lang = "", lastId = "") {
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
        if (encodedId) {
          url += `&target=${encodedId}&lang=${lang}&id=${lastId}`;
        }
        break;

      case "about-us":
        url += "?section=aboutus";
        break;

      default:
        break;
    }
  }

  console.log(url);
  window.location.href = url;
}
