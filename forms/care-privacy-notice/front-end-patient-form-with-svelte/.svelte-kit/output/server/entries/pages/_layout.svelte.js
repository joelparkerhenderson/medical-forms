import { h as head } from "../../chunks/renderer.js";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  head("12qhfyh", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Care Privacy Notice</title>`);
    });
  });
  children($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _layout as default
};
