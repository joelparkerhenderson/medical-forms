import { h as head } from "../../chunks/index.js";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  head("12qhfyh", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Cognitive Assessment — Clinician Dashboard</title>`);
    });
  });
  children($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _layout as default
};
