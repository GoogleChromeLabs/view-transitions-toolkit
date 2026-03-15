import { useAutoTypes } from "../js/navigation.js";

const basePath = window.location.pathname.startsWith("/demo") ? "/demo" : "";
const routeMap = {
  index: `${basePath}/navigation-types/`,
  detail: `${basePath}/navigation-types/detail/:id`,
  about: `${basePath}/navigation-types/about`,
};

useAutoTypes(routeMap);
