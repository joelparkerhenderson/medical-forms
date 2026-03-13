import { e as escape_html, a as attr, b as attr_style, c as stringify, d as derived } from "../../../chunks/index2.js";
import { c as casualtyCard } from "../../../chunks/casualtyCard.svelte.js";
import { g as getVisibleSteps } from "../../../chunks/steps.js";
function ProgressBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { currentStep, steps } = $$props;
    const progress = derived(() => steps.length > 0 ? (steps.findIndex((s) => s.number === currentStep) + 1) / steps.length * 100 : 0);
    const currentIndex = derived(() => steps.findIndex((s) => s.number === currentStep) + 1);
    $$renderer2.push(`<div class="mb-6"><div class="mb-2 flex items-center justify-between text-sm text-gray-600"><span>Step ${escape_html(currentIndex())} of ${escape_html(steps.length)}</span> <span>${escape_html(Math.round(progress()))}% complete</span></div> <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar"${attr("aria-valuenow", Math.round(progress()))}${attr("aria-valuemin", 0)}${attr("aria-valuemax", 100)} aria-label="Assessment progress"><div class="h-2 rounded-full bg-primary transition-all duration-300"${attr_style(`width: ${stringify(progress())}%`)}></div></div></div>`);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    const visibleSteps = derived(getVisibleSteps);
    $$renderer2.push(`<div class="min-h-screen bg-gray-50"><header class="border-b border-gray-200 bg-white shadow-sm no-print"><div class="mx-auto max-w-3xl px-4 py-4"><h1 class="text-lg font-bold text-gray-900">Casualty Card Form</h1></div></header> <main class="mx-auto max-w-3xl px-4 py-6">`);
    ProgressBar($$renderer2, { currentStep: casualtyCard.currentStep, steps: visibleSteps() });
    $$renderer2.push(`<!----> `);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div>`);
  });
}
export {
  _layout as default
};
