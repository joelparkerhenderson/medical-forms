import { g as getContext, a as attr, e as escape_html, f as bind_props, i as ensure_array_like, j as attr_class, c as stringify, d as derived, k as store_get, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import { s as steps, g as getVisibleSteps, a as getNextStep, b as getPrevStep } from "../../../../chunks/steps.js";
import { a as assessment } from "../../../../chunks/assessment.svelte.js";
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
    $$renderer.push(`<button type="button" class="rounded-lg bg-primary px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark">Submit Assessment</button>`);
  } else if (nextHref) {
    $$renderer.push("<!--[1-->");
    $$renderer.push(`<a${attr("href", nextHref)} class="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark">Next →</a>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div>`);
}
function SectionCard($$renderer, $$props) {
  let { title, description = "", children } = $$props;
  $$renderer.push(`<div class="mx-auto max-w-2xl"><div class="mb-6"><h2 class="text-2xl font-bold text-gray-900">${escape_html(title)}</h2> `);
  if (description) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<p class="mt-1 text-sm text-gray-500">${escape_html(description)}</p>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></div> <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">`);
  children($$renderer);
  $$renderer.push(`<!----></div></div>`);
}
function TextInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      label,
      name,
      value = "",
      placeholder = "",
      required = false,
      type = "text"
    } = $$props;
    $$renderer2.push(`<div class="mb-4"><label${attr("for", name)} class="mb-1 block text-sm font-medium text-gray-700">${escape_html(label)} `);
    if (required) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-red-500">*</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></label> <input${attr("id", name)}${attr("name", name)}${attr("type", type)}${attr("placeholder", placeholder)}${attr("required", required, true)}${attr("value", value)} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"/></div>`);
    bind_props($$props, { value });
  });
}
function RadioGroup($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { label, name, options, value = "", required = false } = $$props;
    $$renderer2.push(`<fieldset class="mb-4"><legend class="mb-2 block text-sm font-medium text-gray-700">${escape_html(label)} `);
    if (required) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-red-500">*</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></legend> <div class="flex flex-wrap gap-3"><!--[-->`);
    const each_array = ensure_array_like(options);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let opt = each_array[$$index];
      $$renderer2.push(`<label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${stringify(value === opt.value ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", name)}${attr("value", opt.value)}${attr("checked", value === opt.value, true)}${attr("required", required, true)} class="text-primary accent-primary"/> ${escape_html(opt.label)}</label>`);
    }
    $$renderer2.push(`<!--]--></div></fieldset>`);
    bind_props($$props, { value });
  });
}
function SelectInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { label, name, options, value = "", required = false } = $$props;
    $$renderer2.push(`<div class="mb-4"><label${attr("for", name)} class="mb-1 block text-sm font-medium text-gray-700">${escape_html(label)} `);
    if (required) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-red-500">*</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></label> `);
    $$renderer2.select(
      {
        id: name,
        name,
        required,
        value,
        class: "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`-- Select --`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(options);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let opt = each_array[$$index];
          $$renderer3.option({ value: opt.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(opt.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div>`);
    bind_props($$props, { value });
  });
}
function Step1Demographics($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const d = assessment.data.demographics;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Demographics",
        description: "Basic patient information",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "First Name",
            name: "firstName",
            required: true,
            get value() {
              return d.firstName;
            },
            set value($$value) {
              d.firstName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Last Name",
            name: "lastName",
            required: true,
            get value() {
              return d.lastName;
            },
            set value($$value) {
              d.lastName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          TextInput($$renderer4, {
            label: "Date of Birth",
            name: "dob",
            type: "date",
            required: true,
            get value() {
              return d.dateOfBirth;
            },
            set value($$value) {
              d.dateOfBirth = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Sex",
            name: "sex",
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" }
            ],
            required: true,
            get value() {
              return d.sex;
            },
            set value($$value) {
              d.sex = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Education Level",
            name: "educationLevel",
            options: [
              { value: "none", label: "No formal education" },
              { value: "primary", label: "Primary school" },
              { value: "secondary", label: "Secondary school" },
              { value: "university", label: "University/College" },
              { value: "postgraduate", label: "Postgraduate" }
            ],
            required: true,
            get value() {
              return d.educationLevel;
            },
            set value($$value) {
              d.educationLevel = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Primary Language",
            name: "primaryLanguage",
            placeholder: "e.g., English, Spanish, Mandarin...",
            required: true,
            get value() {
              return d.primaryLanguage;
            },
            set value($$value) {
              d.primaryLanguage = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Handedness",
            name: "handedness",
            options: [
              { value: "right", label: "Right" },
              { value: "left", label: "Left" },
              { value: "ambidextrous", label: "Ambidextrous" }
            ],
            get value() {
              return d.handedness;
            },
            set value($$value) {
              d.handedness = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!---->`);
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function TextArea($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { label, name, value = "", placeholder = "", rows = 3 } = $$props;
    $$renderer2.push(`<div class="mb-4"><label${attr("for", name)} class="mb-1 block text-sm font-medium text-gray-700">${escape_html(label)}</label> <textarea${attr("id", name)}${attr("name", name)}${attr("placeholder", placeholder)}${attr("rows", rows)} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">`);
    const $$body = escape_html(value);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></div>`);
    bind_props($$props, { value });
  });
}
function Step2ReferralInfo($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const r = assessment.data.referralInformation;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Referral Information",
        description: "Details about why and by whom the patient was referred",
        children: ($$renderer4) => {
          SelectInput($$renderer4, {
            label: "Referral Source",
            name: "referralSource",
            options: [
              { value: "gp", label: "General Practitioner (GP)" },
              { value: "neurologist", label: "Neurologist" },
              { value: "psychiatrist", label: "Psychiatrist" },
              { value: "geriatrician", label: "Geriatrician" },
              { value: "self", label: "Self-referral" },
              { value: "family", label: "Family member" },
              { value: "other", label: "Other" }
            ],
            required: true,
            get value() {
              return r.referralSource;
            },
            set value($$value) {
              r.referralSource = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Reason for Referral",
            name: "referralReason",
            options: [
              { value: "memory-concern", label: "Memory concern" },
              { value: "confusion", label: "Confusion/disorientation" },
              { value: "behavioural-change", label: "Behavioural change" },
              { value: "functional-decline", label: "Functional decline" },
              { value: "screening", label: "Routine screening" },
              { value: "follow-up", label: "Follow-up assessment" },
              { value: "other", label: "Other" }
            ],
            required: true,
            get value() {
              return r.referralReason;
            },
            set value($$value) {
              r.referralReason = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Referring Clinician",
            name: "referringClinician",
            placeholder: "Name of referring clinician",
            get value() {
              return r.referringClinician;
            },
            set value($$value) {
              r.referringClinician = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Referral Date",
            name: "referralDate",
            type: "date",
            get value() {
              return r.referralDate;
            },
            set value($$value) {
              r.referralDate = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Urgency",
            name: "urgency",
            options: [
              { value: "routine", label: "Routine" },
              { value: "urgent", label: "Urgent" },
              { value: "emergency", label: "Emergency" }
            ],
            get value() {
              return r.urgency;
            },
            set value($$value) {
              r.urgency = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Has the patient had a previous cognitive assessment?",
            name: "previousAssessment",
            options: yesNo,
            get value() {
              return r.previousCognitiveAssessment;
            },
            set value($$value) {
              r.previousCognitiveAssessment = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (r.previousCognitiveAssessment === "yes") {
            $$renderer4.push("<!--[0-->");
            TextArea($$renderer4, {
              label: "Previous assessment details (date, score, findings)",
              name: "previousAssessmentDetails",
              placeholder: "e.g., MMSE 22/30 on 2025-01-15, mild impairment noted...",
              get value() {
                return r.previousAssessmentDetails;
              },
              set value($$value) {
                r.previousAssessmentDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]-->`);
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Step3Orientation($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const o = assessment.data.orientationScores;
    const timeItems = [
      { key: "year", label: "What year is it?" },
      { key: "season", label: "What season is it?" },
      { key: "date", label: "What is the date today?" },
      { key: "day", label: "What day of the week is it?" },
      { key: "month", label: "What month is it?" }
    ];
    const placeItems = [
      { key: "country", label: "What country are we in?" },
      { key: "county", label: "What county/region are we in?" },
      { key: "town", label: "What town/city are we in?" },
      { key: "hospital", label: "What building are we in?" },
      { key: "floor", label: "What floor are we on?" }
    ];
    SectionCard($$renderer2, {
      title: "Orientation",
      description: "Orientation to time and place (10 points total)",
      children: ($$renderer3) => {
        $$renderer3.push(`<h3 class="mb-3 text-sm font-semibold text-gray-700">Orientation to Time (5 points)</h3> <!--[-->`);
        const each_array = ensure_array_like(timeItems);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><p class="mb-2 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(o[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `orient-${stringify(item.key)}`)}${attr("checked", o[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(o[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `orient-${stringify(item.key)}`)}${attr("checked", o[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]--> <h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Orientation to Place (5 points)</h3> <!--[-->`);
        const each_array_1 = ensure_array_like(placeItems);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let item = each_array_1[$$index_1];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><p class="mb-2 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(o[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `orient-${stringify(item.key)}`)}${attr("checked", o[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(o[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `orient-${stringify(item.key)}`)}${attr("checked", o[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step4Registration($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const reg = assessment.data.registrationScores;
    const items = [
      { key: "object1", label: "Object 1", example: "e.g., Apple" },
      { key: "object2", label: "Object 2", example: "e.g., Table" },
      { key: "object3", label: "Object 3", example: "e.g., Penny" }
    ];
    SectionCard($$renderer2, {
      title: "Registration",
      description: "Name three objects and ask the patient to repeat them (3 points). Record the number of trials needed to learn all three.",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><p class="mb-1 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <p class="mb-2 text-xs text-gray-400">${escape_html(item.example)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(reg[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `reg-${stringify(item.key)}`)}${attr("checked", reg[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(reg[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `reg-${stringify(item.key)}`)}${attr("checked", reg[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step5AttentionCalculation($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const att = assessment.data.attentionScores;
    const items = [
      { key: "serial1", label: "100 - 7 = 93" },
      { key: "serial2", label: "93 - 7 = 86" },
      { key: "serial3", label: "86 - 7 = 79" },
      { key: "serial4", label: "79 - 7 = 72" },
      { key: "serial5", label: "72 - 7 = 65" }
    ];
    SectionCard($$renderer2, {
      title: "Attention & Calculation",
      description: "Serial 7s: Ask the patient to subtract 7 from 100 repeatedly (5 points). Alternative: spell WORLD backwards.",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><p class="mb-2 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(att[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `att-${stringify(item.key)}`)}${attr("checked", att[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(att[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `att-${stringify(item.key)}`)}${attr("checked", att[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step6Recall($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const rec = assessment.data.recallScores;
    const items = [
      { key: "object1", label: "Recall object 1" },
      { key: "object2", label: "Recall object 2" },
      { key: "object3", label: "Recall object 3" }
    ];
    SectionCard($$renderer2, {
      title: "Recall",
      description: "Ask the patient to recall the three objects named in the Registration step (3 points).",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><p class="mb-2 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(rec[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `rec-${stringify(item.key)}`)}${attr("checked", rec[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(rec[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `rec-${stringify(item.key)}`)}${attr("checked", rec[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step7Language($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const lang = assessment.data.languageScores;
    const items = [
      {
        key: "naming1",
        label: "Naming 1",
        instruction: 'Show a pencil. Ask: "What is this?"'
      },
      {
        key: "naming2",
        label: "Naming 2",
        instruction: 'Show a watch. Ask: "What is this?"'
      }
    ];
    SectionCard($$renderer2, {
      title: "Language",
      description: "Naming tasks (2 points). Show objects and ask the patient to name them.",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><p class="mb-1 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <p class="mb-2 text-xs text-gray-400">${escape_html(item.instruction)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(lang[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `lang-${stringify(item.key)}`)}${attr("checked", lang[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(lang[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `lang-${stringify(item.key)}`)}${attr("checked", lang[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step8RepetitionCommands($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const lang = assessment.data.repetitionCommands;
    const repetitionItems = [
      {
        key: "repetition",
        label: "Repetition",
        instruction: 'Ask patient to repeat: "No ifs, ands, or buts"'
      }
    ];
    const commandItems = [
      {
        key: "command1",
        label: "Command 1",
        instruction: "Take this paper in your right hand"
      },
      {
        key: "command2",
        label: "Command 2",
        instruction: "Fold it in half"
      },
      {
        key: "command3",
        label: "Command 3",
        instruction: "Put it on the floor"
      }
    ];
    const readWriteItems = [
      {
        key: "reading",
        label: "Reading",
        instruction: 'Show card: "CLOSE YOUR EYES". Ask patient to read and do what it says.'
      },
      {
        key: "writing",
        label: "Writing",
        instruction: "Ask patient to write a sentence (must contain a subject and a verb, and make sense)."
      }
    ];
    SectionCard($$renderer2, {
      title: "Repetition & Commands",
      description: "Repetition (1 point), three-stage command (3 points), reading (1 point), and writing (1 point).",
      children: ($$renderer3) => {
        $$renderer3.push(`<h3 class="mb-3 text-sm font-semibold text-gray-700">Repetition (1 point)</h3> <!--[-->`);
        const each_array = ensure_array_like(repetitionItems);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3"><p class="mb-1 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <p class="mb-2 text-xs text-gray-400">${escape_html(item.instruction)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(lang[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `lang-${stringify(item.key)}`)}${attr("checked", lang[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(lang[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `lang-${stringify(item.key)}`)}${attr("checked", lang[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]--> <h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Three-Stage Command (3 points)</h3> <!--[-->`);
        const each_array_1 = ensure_array_like(commandItems);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let item = each_array_1[$$index_1];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><p class="mb-1 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <p class="mb-2 text-xs text-gray-400">${escape_html(item.instruction)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(lang[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `lang-${stringify(item.key)}`)}${attr("checked", lang[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(lang[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `lang-${stringify(item.key)}`)}${attr("checked", lang[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]--> <h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Reading &amp; Writing (2 points)</h3> <!--[-->`);
        const each_array_2 = ensure_array_like(readWriteItems);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let item = each_array_2[$$index_2];
          $$renderer3.push(`<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0"><p class="mb-1 text-sm font-medium text-gray-700">${escape_html(item.label)}</p> <p class="mb-2 text-xs text-gray-400">${escape_html(item.instruction)}</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(lang[item.key] === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `lang-${stringify(item.key)}`)}${attr("checked", lang[item.key] === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(lang[item.key] === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `lang-${stringify(item.key)}`)}${attr("checked", lang[item.key] === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step9Visuospatial($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const vis = assessment.data.visuospatialScores;
    SectionCard($$renderer2, {
      title: "Visuospatial",
      description: "Ask the patient to copy intersecting pentagons (1 point). All 10 angles must be present and 2 must intersect.",
      children: ($$renderer3) => {
        $$renderer3.push(`<div class="mb-4"><p class="mb-3 text-sm font-medium text-gray-700">Copy intersecting pentagons</p> <p class="mb-3 text-xs text-gray-400">Show the patient two intersecting pentagons and ask them to copy the design exactly. Score 1 point if all 10 angles are present and two shapes intersect.</p> <div class="flex gap-3"><label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(vis.copying === 1 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio" name="vis-copying"${attr("checked", vis.copying === 1, true)} class="accent-primary"/> Correct (1)</label> <label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors ${stringify(vis.copying === 0 ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio" name="vis-copying"${attr("checked", vis.copying === 0, true)} class="accent-primary"/> Incorrect (0)</label></div></div>`);
      }
    });
  });
}
function Step10FunctionalHistory($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const f = assessment.data.functionalHistory;
    const adlOptions = [
      { value: "independent", label: "Independent" },
      { value: "needs-some-help", label: "Needs some help" },
      {
        value: "needs-significant-help",
        label: "Needs significant help"
      },
      { value: "fully-dependent", label: "Fully dependent" }
    ];
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Functional History",
        description: "Activities of daily living, living situation, and support network",
        children: ($$renderer4) => {
          SelectInput($$renderer4, {
            label: "Living Arrangement",
            name: "livingArrangement",
            options: [
              { value: "alone", label: "Lives alone" },
              { value: "with-spouse", label: "Lives with spouse/partner" },
              { value: "with-family", label: "Lives with family" },
              { value: "care-home", label: "Care home/nursing home" },
              { value: "assisted-living", label: "Assisted living facility" }
            ],
            required: true,
            get value() {
              return f.livingArrangement;
            },
            set value($$value) {
              f.livingArrangement = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <h3 class="mb-3 mt-4 text-sm font-semibold text-gray-700">Activities of Daily Living (ADLs)</h3> `);
          SelectInput($$renderer4, {
            label: "Bathing",
            name: "adlBathing",
            options: adlOptions,
            get value() {
              return f.adlBathing;
            },
            set value($$value) {
              f.adlBathing = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Dressing",
            name: "adlDressing",
            options: adlOptions,
            get value() {
              return f.adlDressing;
            },
            set value($$value) {
              f.adlDressing = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Preparing Meals",
            name: "adlMeals",
            options: adlOptions,
            get value() {
              return f.adlMeals;
            },
            set value($$value) {
              f.adlMeals = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Managing Medications",
            name: "adlMedications",
            options: adlOptions,
            get value() {
              return f.adlMedications;
            },
            set value($$value) {
              f.adlMedications = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Managing Finances",
            name: "adlFinances",
            options: adlOptions,
            get value() {
              return f.adlFinances;
            },
            set value($$value) {
              f.adlFinances = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Using Transport",
            name: "adlTransport",
            options: adlOptions,
            get value() {
              return f.adlTransport;
            },
            set value($$value) {
              f.adlTransport = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Recent changes in function or behaviour",
            name: "recentChanges",
            placeholder: "Describe any recent changes in the patient's abilities, behaviour, or personality...",
            get value() {
              return f.recentChanges;
            },
            set value($$value) {
              f.recentChanges = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Safety concerns",
            name: "safetyConcerns",
            placeholder: "e.g., leaving stove on, wandering, getting lost, falls, driving concerns...",
            get value() {
              return f.safetyConerns;
            },
            set value($$value) {
              f.safetyConerns = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Are carers or support persons available?",
            name: "carersAvailable",
            options: yesNo,
            get value() {
              return f.carersAvailable;
            },
            set value($$value) {
              f.carersAvailable = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (f.carersAvailable === "yes") {
            $$renderer4.push("<!--[0-->");
            TextArea($$renderer4, {
              label: "Carer details",
              name: "carerDetails",
              placeholder: "Name and relationship of carer(s)...",
              get value() {
                return f.carerDetails;
              },
              set value($$value) {
                f.carerDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]-->`);
        }
      });
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
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
      if (stepNumber() === 1) {
        $$renderer2.push("<!--[0-->");
        Step1Demographics($$renderer2);
      } else if (stepNumber() === 2) {
        $$renderer2.push("<!--[1-->");
        Step2ReferralInfo($$renderer2);
      } else if (stepNumber() === 3) {
        $$renderer2.push("<!--[2-->");
        Step3Orientation($$renderer2);
      } else if (stepNumber() === 4) {
        $$renderer2.push("<!--[3-->");
        Step4Registration($$renderer2);
      } else if (stepNumber() === 5) {
        $$renderer2.push("<!--[4-->");
        Step5AttentionCalculation($$renderer2);
      } else if (stepNumber() === 6) {
        $$renderer2.push("<!--[5-->");
        Step6Recall($$renderer2);
      } else if (stepNumber() === 7) {
        $$renderer2.push("<!--[6-->");
        Step7Language($$renderer2);
      } else if (stepNumber() === 8) {
        $$renderer2.push("<!--[7-->");
        Step8RepetitionCommands($$renderer2);
      } else if (stepNumber() === 9) {
        $$renderer2.push("<!--[8-->");
        Step9Visuospatial($$renderer2);
      } else if (stepNumber() === 10) {
        $$renderer2.push("<!--[9-->");
        Step10FunctionalHistory($$renderer2);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      StepNavigation($$renderer2, {
        prevHref: prevHref(),
        nextHref: nextHref(),
        isLast: isLast()
      });
      $$renderer2.push(`<!---->`);
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
