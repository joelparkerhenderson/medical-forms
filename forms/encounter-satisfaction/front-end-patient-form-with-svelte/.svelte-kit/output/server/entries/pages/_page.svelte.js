import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4"><div class="w-full max-w-lg text-center"><div class="mb-8"><div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"><svg class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div> <h1 class="text-3xl font-bold text-gray-900">Encounter Satisfaction Survey</h1> <p class="mt-3 text-gray-600">Help us improve your healthcare experience. This survey collects your feedback
				on a recent visit, including scheduling, communication, staff interactions, care quality,
				and the facility environment.</p></div> <div class="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm"><h2 class="mb-3 font-semibold text-gray-900">What to expect</h2> <ul class="space-y-2 text-sm text-gray-600"><li class="flex items-start gap-2"><span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span> 8 sections covering your visit experience</li> <li class="flex items-start gap-2"><span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span> Takes approximately 3-5 minutes to complete</li> <li class="flex items-start gap-2"><span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span> You can navigate back to change answers at any time</li> <li class="flex items-start gap-2"><span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span> A satisfaction report will be generated with a downloadable PDF</li></ul></div> <button class="mt-6 w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark">Begin Survey</button> <p class="mt-4 text-xs text-gray-400">Your responses are confidential and will be used to improve the quality of care.</p></div></div>`);
  });
}
export {
  _page as default
};
