import { a as attr_class, b as stringify, e as escape_html, c as ensure_array_like, d as derived } from "../../chunks/renderer.js";
import { a as assessment } from "../../chunks/assessment.svelte.js";
import { c as completenessColor } from "../../chunks/utils2.js";
import { S as Step1PracticeConfiguration, a as Step2PrivacyNotice, b as Step3AcknowledgmentSignature } from "../../chunks/Step3AcknowledgmentSignature.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const submitted = derived(() => assessment.result !== null);
    const priorityColor = {
      high: "bg-red-100 text-red-800 border-red-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-gray-100 text-gray-700 border-gray-300"
    };
    $$renderer2.push(`<div class="min-h-screen bg-gray-50"><header class="border-b border-nhs-blue bg-nhs-blue shadow-sm no-print"><div class="mx-auto max-w-2xl px-4 py-4"><h1 class="text-xl font-bold text-white">Care Privacy Notice</h1> <p class="mt-0.5 text-sm text-blue-100">Based on the BMA GDPR template for GP practices</p></div></header> <main class="mx-auto max-w-2xl px-4 py-8">`);
    if (submitted() && assessment.result) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="mb-6 flex items-center justify-between"><h2 class="text-2xl font-bold text-gray-900">Submission Summary</h2> <div class="flex gap-3 no-print"><button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Print</button> <button class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">New Form</button></div></div> <div${attr_class(`mb-6 rounded-xl border-2 p-6 text-center ${stringify(completenessColor(assessment.result.completenessPercent))}`)}><div class="text-3xl font-bold">${escape_html(assessment.result.completenessPercent)}% Complete</div> <div class="mt-1 text-lg">${escape_html(assessment.result.status)}</div> <div class="mt-2 text-sm opacity-75">Generated ${escape_html(new Date(assessment.result.timestamp).toLocaleString())}</div></div> `);
      if (assessment.result.additionalFlags.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-red-200 bg-white p-6"><h3 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h3> <div class="space-y-2"><!--[-->`);
        const each_array = ensure_array_like(assessment.result.additionalFlags);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let flag = each_array[$$index];
          $$renderer2.push(`<div${attr_class(`flex items-start gap-3 rounded-lg border p-3 ${stringify(priorityColor[flag.priority])}`)}><span${attr_class(`mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase ${stringify(priorityColor[flag.priority])}`)}>${escape_html(flag.priority)}</span> <div><span class="font-medium">${escape_html(flag.category)}:</span> ${escape_html(flag.message)}</div></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (assessment.result.firedRules.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h3 class="mb-4 text-lg font-bold text-gray-900">Missing Required Fields</h3> <table class="w-full text-sm"><thead><tr class="border-b text-left text-gray-600"><th class="pb-2 pr-4">Rule</th><th class="pb-2 pr-4">Section</th><th class="pb-2 pr-4">Issue</th><th class="pb-2">Field</th></tr></thead><tbody><!--[-->`);
        const each_array_1 = ensure_array_like(assessment.result.firedRules);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let rule = each_array_1[$$index_1];
          $$renderer2.push(`<tr class="border-b border-gray-100"><td class="py-2 pr-4 font-mono text-xs text-gray-500">${escape_html(rule.id)}</td><td class="py-2 pr-4">${escape_html(rule.section)}</td><td class="py-2 pr-4">${escape_html(rule.description)}</td><td class="py-2 font-mono text-xs">${escape_html(rule.field)}</td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h3 class="mb-4 text-lg font-bold text-gray-900">Acknowledgment Summary</h3> <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><span class="font-medium text-gray-600">Acknowledged:</span> <span${attr_class(assessment.data.acknowledgmentSignature.agreed ? "font-bold text-green-700" : "font-bold text-red-700")}>${escape_html(assessment.data.acknowledgmentSignature.agreed ? "Yes" : "No")}</span></div> <div><span class="font-medium text-gray-600">Patient Name:</span> ${escape_html(assessment.data.acknowledgmentSignature.patientTypedFullName || "N/A")}</div> <div><span class="font-medium text-gray-600">Date:</span> ${escape_html(assessment.data.acknowledgmentSignature.patientTypedDate || "N/A")}</div> <div><span class="font-medium text-gray-600">Practice:</span> ${escape_html(assessment.data.practiceConfiguration.practiceName || "N/A")}</div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="mb-8">`);
      Step1PracticeConfiguration($$renderer2);
      $$renderer2.push(`<!----></div> <div class="mb-8">`);
      Step2PrivacyNotice($$renderer2);
      $$renderer2.push(`<!----></div> <div class="mb-8">`);
      Step3AcknowledgmentSignature($$renderer2);
      $$renderer2.push(`<!----></div> <div class="mx-auto max-w-2xl"><button class="w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark">Submit Privacy Notice Acknowledgment</button> <p class="mt-3 text-center text-xs text-gray-400">For clinical administration only. Based on BMA GDPR template for GP practices.</p></div>`);
    }
    $$renderer2.push(`<!--]--></main></div>`);
  });
}
export {
  _page as default
};
