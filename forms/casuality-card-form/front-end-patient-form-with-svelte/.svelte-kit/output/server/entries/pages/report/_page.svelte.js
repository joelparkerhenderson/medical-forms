import { j as attr_class, c as stringify, e as escape_html, i as ensure_array_like, d as derived } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { c as casualtyCard } from "../../../chunks/casualtyCard.svelte.js";
import { b as news2ScoreColor, a as news2ResponseLabel, c as calculateAge, m as mtsCategoryLabel } from "../../../chunks/utils2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const data = derived(() => casualtyCard.data);
    const result = derived(() => casualtyCard.result);
    const priorityColor = {
      high: "bg-red-100 text-red-800 border-red-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-gray-100 text-gray-700 border-gray-300"
    };
    if (result()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="min-h-screen bg-gray-50"><header class="border-b border-gray-200 bg-white shadow-sm no-print"><div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4"><h1 class="text-lg font-bold text-gray-900">Casualty Card Report</h1> <div class="flex gap-3"><button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Print</button> <button class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">New Form</button></div></div></header> <main class="mx-auto max-w-4xl px-4 py-6"><div${attr_class(`mb-6 rounded-xl border-2 p-6 text-center ${stringify(news2ScoreColor(result().news2.totalScore))}`)}><div class="text-3xl font-bold">NEWS2: ${escape_html(result().news2.totalScore)}</div> <div class="mt-1 text-lg">${escape_html(news2ResponseLabel(result().news2.clinicalResponse))}</div> <div class="mt-2 text-sm opacity-75">Generated ${escape_html(new Date(result().timestamp).toLocaleString())}</div></div> <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">NEWS2 Parameter Scores</h2> <table class="w-full text-sm"><thead><tr class="border-b text-left text-gray-600"><th class="pb-2 pr-4">Parameter</th><th class="pb-2 pr-4">Value</th><th class="pb-2">Score</th></tr></thead><tbody><!--[-->`);
      const each_array = ensure_array_like(result().news2.parameterScores);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let ps = each_array[$$index];
        $$renderer2.push(`<tr class="border-b border-gray-100"><td class="py-2 pr-4">${escape_html(ps.parameter)}</td><td class="py-2 pr-4">${escape_html(ps.value)}</td><td class="py-2"><span${attr_class(`rounded px-2 py-0.5 text-xs font-bold ${stringify(ps.score >= 3 ? "bg-red-100 text-red-800" : ps.score >= 1 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800")}`)}>${escape_html(ps.score)}</span></td></tr>`);
      }
      $$renderer2.push(`<!--]--></tbody></table></div> `);
      if (result().flaggedIssues.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-red-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h2> <div class="space-y-2"><!--[-->`);
        const each_array_1 = ensure_array_like(result().flaggedIssues);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let flag = each_array_1[$$index_1];
          $$renderer2.push(`<div${attr_class(`flex items-start gap-3 rounded-lg border p-3 ${stringify(priorityColor[flag.priority])}`)}><span${attr_class(`mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase ${stringify(priorityColor[flag.priority])}`)}>${escape_html(flag.priority)}</span> <div><span class="font-medium">${escape_html(flag.category)}:</span> ${escape_html(flag.message)}</div></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Patient Summary</h2> <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><span class="font-medium text-gray-600">Name:</span> ${escape_html(data().demographics.firstName)} ${escape_html(data().demographics.lastName)}</div> <div><span class="font-medium text-gray-600">DOB:</span> ${escape_html(data().demographics.dateOfBirth)} `);
      if (calculateAge(data().demographics.dateOfBirth)) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`(Age ${escape_html(calculateAge(data().demographics.dateOfBirth))})`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div><span class="font-medium text-gray-600">Sex:</span> ${escape_html(data().demographics.sex)}</div> <div><span class="font-medium text-gray-600">NHS Number:</span> ${escape_html(data().demographics.nhsNumber || "N/A")}</div></div></div> `);
      if (data().arrivalTriage.mtsCategory) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Triage</h2> <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><span class="font-medium text-gray-600">MTS Category:</span> ${escape_html(mtsCategoryLabel(data().arrivalTriage.mtsCategory))}</div> <div><span class="font-medium text-gray-600">Arrival Mode:</span> ${escape_html(data().arrivalTriage.arrivalMode)}</div> `);
        if (data().arrivalTriage.mtsFlowchart) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div><span class="font-medium text-gray-600">MTS Flowchart:</span> ${escape_html(data().arrivalTriage.mtsFlowchart)}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data().presentingComplaint.chiefComplaint) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Presenting Complaint</h2> <div class="text-sm"><p><span class="font-medium text-gray-600">Chief Complaint:</span> ${escape_html(data().presentingComplaint.chiefComplaint)}</p> `);
        if (data().presentingComplaint.historyOfPresentingComplaint) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="mt-2"><span class="font-medium text-gray-600">HPC:</span> ${escape_html(data().presentingComplaint.historyOfPresentingComplaint)}</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data().assessmentPlan.workingDiagnosis) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Assessment &amp; Plan</h2> <div class="text-sm"><p><span class="font-medium text-gray-600">Working Diagnosis:</span> ${escape_html(data().assessmentPlan.workingDiagnosis)}</p> `);
        if (data().assessmentPlan.differentialDiagnoses) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="mt-2"><span class="font-medium text-gray-600">Differentials:</span> ${escape_html(data().assessmentPlan.differentialDiagnoses)}</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (data().assessmentPlan.clinicalImpression) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="mt-2"><span class="font-medium text-gray-600">Clinical Impression:</span> ${escape_html(data().assessmentPlan.clinicalImpression)}</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data().medicalHistory.medications.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Medications</h2> <ul class="list-disc space-y-1 pl-5 text-sm"><!--[-->`);
        const each_array_2 = ensure_array_like(data().medicalHistory.medications);
        for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
          let med = each_array_2[i];
          $$renderer2.push(`<li>${escape_html(med.name)} ${escape_html(med.dose)} ${escape_html(med.frequency)}</li>`);
        }
        $$renderer2.push(`<!--]--></ul></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data().medicalHistory.allergies.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Allergies</h2> <ul class="list-disc space-y-1 pl-5 text-sm"><!--[-->`);
        const each_array_3 = ensure_array_like(data().medicalHistory.allergies);
        for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
          let allergy = each_array_3[i];
          $$renderer2.push(`<li><strong>${escape_html(allergy.allergen)}</strong> - ${escape_html(allergy.reaction)} `);
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
      $$renderer2.push(`<!--]--> `);
      if (data().disposition.disposition) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Disposition</h2> <div class="text-sm"><p><span class="font-medium text-gray-600">Outcome:</span> ${escape_html(data().disposition.disposition)}</p> `);
        if (data().disposition.disposition === "admitted") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="mt-1"><span class="font-medium text-gray-600">Specialty:</span> ${escape_html(data().disposition.admittingSpecialty)}</p> <p class="mt-1"><span class="font-medium text-gray-600">Ward:</span> ${escape_html(data().disposition.ward)}</p>`);
        } else if (data().disposition.disposition === "discharged") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<p class="mt-1"><span class="font-medium text-gray-600">Diagnosis:</span> ${escape_html(data().disposition.dischargeDiagnosis)}</p> `);
          if (data().disposition.followUp) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<p class="mt-1"><span class="font-medium text-gray-600">Follow-up:</span> ${escape_html(data().disposition.followUp)}</p>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else if (data().disposition.disposition === "transferred") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`<p class="mt-1"><span class="font-medium text-gray-600">Receiving Hospital:</span> ${escape_html(data().disposition.receivingHospital)}</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (data().safeguardingConsent.completedByName) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6"><h2 class="mb-4 text-lg font-bold text-gray-900">Completed By</h2> <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><span class="font-medium text-gray-600">Name:</span> ${escape_html(data().safeguardingConsent.completedByName)}</div> <div><span class="font-medium text-gray-600">Role:</span> ${escape_html(data().safeguardingConsent.completedByRole)}</div> `);
        if (data().safeguardingConsent.completedByGmcNumber) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div><span class="font-medium text-gray-600">GMC:</span> ${escape_html(data().safeguardingConsent.completedByGmcNumber)}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (data().safeguardingConsent.seniorReviewingClinician) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div><span class="font-medium text-gray-600">Senior Reviewer:</span> ${escape_html(data().safeguardingConsent.seniorReviewingClinician)}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div>`);
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
