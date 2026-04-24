import { d as attr_class, s as stringify, e as escape_html, c as ensure_array_like, f as derived } from "../../../chunks/renderer.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { a as assessment } from "../../../chunks/assessment.svelte.js";
import { a as riskLevelColor, r as riskLevelLabel, c as calculateAge } from "../../../chunks/utils2.js";
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
      $$renderer2.push(`<div class="min-h-screen bg-gray-50"><header class="border-b border-gray-200 bg-white shadow-sm no-print"><div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4"><h1 class="text-lg font-bold text-gray-900">Intake Report</h1> <div class="flex gap-3">`);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Download PDF</button> <button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Print</button> <button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">New Intake</button></div></div></header> <main class="mx-auto max-w-4xl px-4 py-6"><div${attr_class(`mb-6 rounded-xl border-2 p-6 text-center ${stringify(riskLevelColor(result().riskLevel))}`)}><div class="text-3xl font-bold capitalize">${escape_html(result().riskLevel)} Risk</div> <div class="mt-1 text-lg">${escape_html(riskLevelLabel(result().riskLevel))}</div> <div class="mt-2 text-sm opacity-75">Generated ${escape_html(new Date(result().timestamp).toLocaleString())}</div></div> `);
      if (result().additionalFlags.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-red-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues for Clinician</h2> <div class="space-y-2"><!--[-->`);
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
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Risk Classification Justification</h2> <table class="w-full text-sm"><thead><tr class="border-b text-left text-gray-600"><th class="pb-2 pr-4">Rule</th><th class="pb-2 pr-4">Category</th><th class="pb-2 pr-4">Finding</th><th class="pb-2">Risk</th></tr></thead><tbody><!--[-->`);
        const each_array_1 = ensure_array_like(result().firedRules);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let rule = each_array_1[$$index_1];
          $$renderer2.push(`<tr class="border-b border-gray-100"><td class="py-2 pr-4 font-mono text-xs text-gray-500">${escape_html(rule.id)}</td><td class="py-2 pr-4">${escape_html(rule.category)}</td><td class="py-2 pr-4">${escape_html(rule.description)}</td><td class="py-2 capitalize">${escape_html(rule.riskLevel)}</td></tr>`);
        }
        $$renderer2.push(`<!--]--></tbody></table></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Patient Summary</h2> <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><span class="font-medium text-gray-600">Name:</span> ${escape_html(data().personalInformation.fullName)}</div> <div><span class="font-medium text-gray-600">DOB:</span> ${escape_html(data().personalInformation.dateOfBirth)} `);
      if (calculateAge(data().personalInformation.dateOfBirth)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`(Age ${escape_html(calculateAge(data().personalInformation.dateOfBirth))})`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div><span class="font-medium text-gray-600">Sex:</span> ${escape_html(data().personalInformation.sex)}</div> <div><span class="font-medium text-gray-600">NHS Number:</span> ${escape_html(data().insuranceAndId.nhsNumber || "N/A")}</div> <div class="sm:col-span-2"><span class="font-medium text-gray-600">Reason for Visit:</span> ${escape_html(data().reasonForVisit.primaryReason)}
						(${escape_html(data().reasonForVisit.urgencyLevel)})</div></div></div> `);
      if (data().medications.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Medications</h2> <ul class="list-disc space-y-1 pl-5 text-sm"><!--[-->`);
        const each_array_2 = ensure_array_like(data().medications);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let med = each_array_2[$$index_2];
          $$renderer2.push(`<li>${escape_html(med.name)} ${escape_html(med.dose)} ${escape_html(med.frequency)} (prescribed by ${escape_html(med.prescriber || "N/A")})</li>`);
        }
        $$renderer2.push(`<!--]--></ul></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data().allergies.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Allergies</h2> <ul class="list-disc space-y-1 pl-5 text-sm"><!--[-->`);
        const each_array_3 = ensure_array_like(data().allergies);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let allergy = each_array_3[$$index_3];
          $$renderer2.push(`<li><strong>${escape_html(allergy.allergen)}</strong> (${escape_html(allergy.allergyType)}) - ${escape_html(allergy.reaction)} `);
          if (allergy.severity) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span${attr_class(`ml-1 rounded px-1.5 py-0.5 text-xs ${stringify(allergy.severity === "anaphylaxis" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}`)}>${escape_html(allergy.severity)}</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></li>`);
        }
        $$renderer2.push(`<!--]--></ul></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></main></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
