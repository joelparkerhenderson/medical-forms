import { a as attr_class, s as stringify, e as escape_html, b as ensure_array_like, d as derived } from "../../../chunks/renderer.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { a as assessment } from "../../../chunks/assessment.svelte.js";
import { c as completenessColor } from "../../../chunks/utils2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const data = derived(() => assessment.data);
    const result = derived(() => assessment.result);
    const priorityColor = {
      high: "bg-red-100 text-red-800 border-red-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-gray-100 text-gray-700 border-gray-300"
    };
    if (result()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="min-h-screen bg-gray-50"><header class="border-b border-gray-200 bg-white shadow-sm no-print"><div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4"><h1 class="text-lg font-bold text-gray-900">Privacy Notice Summary</h1> <div class="flex gap-3"><button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Print</button> <button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">New Form</button></div></div></header> <main class="mx-auto max-w-4xl px-4 py-6"><div${attr_class(`mb-6 rounded-xl border-2 p-6 text-center ${stringify(completenessColor(result().completenessPercent))}`)}><div class="text-3xl font-bold">${escape_html(result().completenessPercent)}% Complete</div> <div class="mt-1 text-lg">${escape_html(result().status)}</div> <div class="mt-2 text-sm opacity-75">Generated ${escape_html(new Date(result().timestamp).toLocaleString())}</div></div> `);
      if (result().additionalFlags.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-red-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h2> <div class="space-y-2"><!--[-->`);
        const each_array = ensure_array_like(result().additionalFlags);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let flag = each_array[$$index];
          $$renderer2.push(`<div${attr_class(`flex items-start gap-3 rounded-lg border p-3 ${stringify(priorityColor[flag.priority])}`)}><span${attr_class(`mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase ${stringify(priorityColor[flag.priority])}`)}>${escape_html(flag.priority)}</span> <div><span class="font-medium">${escape_html(flag.category)}:</span> ${escape_html(flag.message)}</div></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (result().firedRules.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Missing Required Fields</h2> <table class="w-full text-sm"><thead><tr class="border-b text-left text-gray-600"><th class="pb-2 pr-4">Rule</th><th class="pb-2 pr-4">Section</th><th class="pb-2 pr-4">Issue</th><th class="pb-2">Field</th></tr></thead><tbody><!--[-->`);
        const each_array_1 = ensure_array_like(result().firedRules);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let rule = each_array_1[$$index_1];
          $$renderer2.push(`<tr class="border-b border-gray-100"><td class="py-2 pr-4 font-mono text-xs text-gray-500">${escape_html(rule.id)}</td><td class="py-2 pr-4">${escape_html(rule.section)}</td><td class="py-2 pr-4">${escape_html(rule.description)}</td><td class="py-2 font-mono text-xs">${escape_html(rule.field)}</td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Acknowledgment Summary</h2> <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><span class="font-medium text-gray-600">Acknowledged:</span> <span${attr_class(data().acknowledgmentSignature.agreed ? "text-green-700 font-bold" : "text-red-700 font-bold")}>${escape_html(data().acknowledgmentSignature.agreed ? "Yes" : "No")}</span></div> <div><span class="font-medium text-gray-600">Patient Name:</span> ${escape_html(data().acknowledgmentSignature.patientTypedFullName || "N/A")}</div> <div><span class="font-medium text-gray-600">Date:</span> ${escape_html(data().acknowledgmentSignature.patientTypedDate || "N/A")}</div> <div><span class="font-medium text-gray-600">Practice:</span> ${escape_html(data().practiceConfiguration.practiceName || "N/A")}</div></div></div></main></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
