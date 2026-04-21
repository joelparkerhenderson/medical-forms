import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4"><div class="w-full max-w-lg text-center"><div class="mb-8"><div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><svg class="h-8 w-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path></svg></div> <h1 class="text-3xl font-bold text-gray-900">Casualty Card Form</h1> <p class="mt-3 text-gray-600">Emergency Department / Minor Injury Unit clinical documentation.
				Captures patient information from arrival through triage, assessment,
				treatment, and disposition including NEWS2 scoring.</p></div> <div class="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm"><h2 class="mb-3 font-semibold text-gray-900">What this form covers</h2> <ul class="space-y-2 text-sm text-gray-600"><li class="flex items-start gap-2"><span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger"></span> 14 sections from demographics to safeguarding</li> <li class="flex items-start gap-2"><span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger"></span> NEWS2 auto-calculation from vital signs</li> <li class="flex items-start gap-2"><span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger"></span> ABCDE primary survey and clinical examination</li> <li class="flex items-start gap-2"><span class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-danger"></span> Summary report with flagged safety issues</li></ul></div> <button class="mt-6 w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark">Begin Casualty Card</button> <p class="mt-4 text-xs text-gray-400">This tool is for clinical support only. All assessments must be reviewed by a qualified clinician.</p></div></div>`);
  });
}
export {
  _page as default
};
