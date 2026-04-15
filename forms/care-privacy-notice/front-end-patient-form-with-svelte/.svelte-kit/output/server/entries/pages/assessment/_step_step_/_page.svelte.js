import { g as getContext, e as escape_html, f as attr, i as attr_style, b as stringify, d as derived, j as store_get, u as unsubscribe_stores } from "../../../../chunks/renderer.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import { S as Step1PracticeConfiguration, a as Step2PrivacyNotice, b as Step3AcknowledgmentSignature } from "../../../../chunks/Step3AcknowledgmentSignature.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
const steps = [
  { number: 1, title: "Practice Configuration", shortTitle: "Practice", section: "practiceConfiguration" },
  { number: 2, title: "Privacy Notice", shortTitle: "Notice", section: "privacyNotice" },
  { number: 3, title: "Acknowledgment & Signature", shortTitle: "Acknowledgment", section: "acknowledgmentSignature" }
];
function getVisibleSteps() {
  return steps;
}
function getNextStep(current) {
  const visible = getVisibleSteps();
  const idx = visible.findIndex((s) => s.number === current);
  if (idx === -1 || idx >= visible.length - 1) return null;
  return visible[idx + 1].number;
}
function getPrevStep(current) {
  const visible = getVisibleSteps();
  const idx = visible.findIndex((s) => s.number === current);
  if (idx <= 0) return null;
  return visible[idx - 1].number;
}
function ProgressBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { currentStep, steps: steps2 } = $$props;
    const progress = derived(() => steps2.length > 0 ? (steps2.findIndex((s) => s.number === currentStep) + 1) / steps2.length * 100 : 0);
    const currentIndex = derived(() => steps2.findIndex((s) => s.number === currentStep) + 1);
    $$renderer2.push(`<div class="mb-6"><div class="mb-2 flex items-center justify-between text-sm text-gray-600"><span>Step ${escape_html(currentIndex())} of ${escape_html(steps2.length)}</span> <span>${escape_html(Math.round(progress()))}% complete</span></div> <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar"${attr("aria-valuenow", Math.round(progress()))}${attr("aria-valuemin", 0)}${attr("aria-valuemax", 100)} aria-label="Form progress"><div class="h-2 rounded-full bg-primary transition-all duration-300"${attr_style(`width: ${stringify(progress())}%`)}></div></div></div>`);
  });
}
function StepNavigation($$renderer, $$props) {
  let { prevHref, nextHref, isLast = false } = $$props;
  $$renderer.push(`<div class="mt-8 flex justify-between">`);
  if (prevHref) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<a${attr("href", prevHref)} class="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">← Previous</a>`);
  } else {
    $$renderer.push("<!--[-1-->");
    $$renderer.push(`<div></div>`);
  }
  $$renderer.push(`<!--]--> `);
  if (isLast) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<button type="button" class="rounded-lg bg-primary px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark">Submit Privacy Notice</button>`);
  } else if (nextHref) {
    $$renderer.push("<!--[1-->");
    $$renderer.push(`<a${attr("href", nextHref)} class="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark">Next →</a>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const stepNumber = derived(() => Number(store_get($$store_subs ??= {}, "$page", page).params.step));
    const stepConfig = derived(() => steps.find((s) => s.number === stepNumber()));
    const visibleSteps = derived(getVisibleSteps);
    const isLast = derived(() => visibleSteps()[visibleSteps().length - 1]?.number === stepNumber());
    const nextStep = derived(() => getNextStep(stepNumber()));
    const prevStep = derived(() => getPrevStep(stepNumber()));
    const nextHref = derived(() => nextStep() ? `/assessment/${nextStep()}` : null);
    const prevHref = derived(() => prevStep() ? `/assessment/${prevStep()}` : null);
    if (stepConfig()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="min-h-screen bg-gray-50 px-4 py-8"><div class="mx-auto max-w-2xl">`);
      ProgressBar($$renderer2, { currentStep: stepNumber(), steps });
      $$renderer2.push(`<!----></div> `);
      if (stepNumber() === 1) {
        $$renderer2.push("<!--[0-->");
        Step1PracticeConfiguration($$renderer2);
      } else if (stepNumber() === 2) {
        $$renderer2.push("<!--[1-->");
        Step2PrivacyNotice($$renderer2);
      } else if (stepNumber() === 3) {
        $$renderer2.push("<!--[2-->");
        Step3AcknowledgmentSignature($$renderer2);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mx-auto max-w-2xl">`);
      StepNavigation($$renderer2, {
        prevHref: prevHref(),
        nextHref: nextHref(),
        isLast: isLast()
      });
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
