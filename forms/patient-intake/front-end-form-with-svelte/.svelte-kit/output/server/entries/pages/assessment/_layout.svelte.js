import "clsx";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  $$renderer.push(`<div class="min-h-screen bg-gray-50"><header class="border-b border-gray-200 bg-white shadow-sm no-print"><div class="mx-auto max-w-3xl px-4 py-4"><h1 class="text-lg font-bold text-gray-900">Patient Intake Form</h1></div></header> <main class="mx-auto max-w-3xl px-4 py-6">`);
  children($$renderer);
  $$renderer.push(`<!----></main></div>`);
}
export {
  _layout as default
};
