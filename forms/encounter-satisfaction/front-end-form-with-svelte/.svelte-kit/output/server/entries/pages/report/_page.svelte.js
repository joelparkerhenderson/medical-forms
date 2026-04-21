import { j as attr_class, c as stringify, e as escape_html, i as ensure_array_like, b as attr_style, d as derived } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { a as assessment } from "../../../chunks/assessment.svelte.js";
import { s as satisfactionScoreColor, c as calculateAge } from "../../../chunks/utils2.js";
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
      $$renderer2.push(`<div class="min-h-screen bg-gray-50"><header class="border-b border-gray-200 bg-white shadow-sm no-print"><div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4"><h1 class="text-lg font-bold text-gray-900">Satisfaction Report</h1> <div class="flex gap-3">`);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">Download PDF</button> <button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Print</button> <button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">New Survey</button></div></div></header> <main class="mx-auto max-w-4xl px-4 py-6"><div${attr_class(`mb-6 rounded-xl border-2 p-6 text-center ${stringify(satisfactionScoreColor(result().compositeScore))}`)}><div class="text-3xl font-bold">${escape_html(result().compositeScore.toFixed(1))}/5.0</div> <div class="mt-1 text-lg">${escape_html(result().category)}</div> <div class="mt-2 text-sm opacity-75">${escape_html(result().answeredCount)} of 19 questions answered |
					Generated ${escape_html(new Date(result().timestamp).toLocaleString())}</div></div> `);
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
      if (result().domainScores.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Score Breakdown by Domain</h2> <div class="space-y-4"><!--[-->`);
        const each_array_1 = ensure_array_like(result().domainScores);
        for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
          let domain = each_array_1[$$index_2];
          $$renderer2.push(`<div><div class="mb-1 flex items-center justify-between"><span class="text-sm font-semibold text-gray-700">${escape_html(domain.domain)}</span> <span${attr_class(`text-sm font-bold ${stringify(satisfactionScoreColor(domain.mean))} rounded px-2 py-0.5`)}>${escape_html(domain.mean.toFixed(1))}/5.0</span></div> <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200"><div class="h-2 rounded-full bg-primary transition-all duration-300"${attr_style(`width: ${stringify(domain.mean / 5 * 100)}%`)}></div></div> <table class="mt-2 w-full text-sm"><tbody><!--[-->`);
          const each_array_2 = ensure_array_like(domain.questions);
          for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
            let q = each_array_2[$$index_1];
            $$renderer2.push(`<tr class="border-b border-gray-50"><td class="py-1 pr-4 font-mono text-xs text-gray-400">${escape_html(q.id)}</td><td class="py-1 pr-4 text-gray-600">${escape_html(q.text)}</td><td class="py-1 font-bold">${escape_html(q.score)}/5</td></tr>`);
          }
          $$renderer2.push(`<!--]--></tbody></table></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Patient &amp; Visit Summary</h2> <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><span class="font-medium text-gray-600">Name:</span> ${escape_html(data().demographics.firstName)} ${escape_html(data().demographics.lastName)}</div> <div><span class="font-medium text-gray-600">DOB:</span> ${escape_html(data().demographics.dateOfBirth)} `);
      if (calculateAge(data().demographics.dateOfBirth)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`(Age ${escape_html(calculateAge(data().demographics.dateOfBirth))})`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div><span class="font-medium text-gray-600">Sex:</span> ${escape_html(data().demographics.sex)}</div> <div><span class="font-medium text-gray-600">Visit Date:</span> ${escape_html(data().visitInformation.visitDate || "N/A")}</div> <div><span class="font-medium text-gray-600">Department:</span> ${escape_html(data().visitInformation.department || "N/A")}</div> <div><span class="font-medium text-gray-600">Provider:</span> ${escape_html(data().visitInformation.providerName || "N/A")}</div> <div><span class="font-medium text-gray-600">Visit Type:</span> ${escape_html(data().visitInformation.visitType || "N/A")}</div> <div><span class="font-medium text-gray-600">First Visit:</span> ${escape_html(data().visitInformation.firstVisit || "N/A")}</div></div></div> `);
      if (data().overallSatisfaction.comments) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Patient Comments</h2> <p class="text-sm text-gray-700 whitespace-pre-wrap">${escape_html(data().overallSatisfaction.comments)}</p></div>`);
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
