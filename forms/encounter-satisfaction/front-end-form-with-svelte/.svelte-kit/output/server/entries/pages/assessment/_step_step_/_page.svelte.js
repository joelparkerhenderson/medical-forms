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
const satisfactionQuestions = [
  // ─── Access & Scheduling (3) ────────────────────────────
  {
    id: "ESS-01",
    domain: "Access & Scheduling",
    field: "easeOfScheduling",
    text: "How satisfied were you with the ease of scheduling your appointment?"
  },
  {
    id: "ESS-02",
    domain: "Access & Scheduling",
    field: "waitForAppointment",
    text: "How satisfied were you with the time you waited to get an appointment?"
  },
  {
    id: "ESS-03",
    domain: "Access & Scheduling",
    field: "waitInWaitingRoom",
    text: "How satisfied were you with the time you waited in the waiting room?"
  },
  // ─── Communication (4) ──────────────────────────────────
  {
    id: "ESS-04",
    domain: "Communication",
    field: "listening",
    text: "How satisfied were you with how well the provider listened to you?"
  },
  {
    id: "ESS-05",
    domain: "Communication",
    field: "explainingCondition",
    text: "How satisfied were you with how clearly your condition was explained?"
  },
  {
    id: "ESS-06",
    domain: "Communication",
    field: "answeringQuestions",
    text: "How satisfied were you with how thoroughly your questions were answered?"
  },
  {
    id: "ESS-07",
    domain: "Communication",
    field: "timeSpent",
    text: "How satisfied were you with the amount of time the provider spent with you?"
  },
  // ─── Staff & Professionalism (3) ────────────────────────
  {
    id: "ESS-08",
    domain: "Staff & Professionalism",
    field: "receptionCourtesy",
    text: "How satisfied were you with the courtesy of the reception staff?"
  },
  {
    id: "ESS-09",
    domain: "Staff & Professionalism",
    field: "nursingCourtesy",
    text: "How satisfied were you with the courtesy of the nursing staff?"
  },
  {
    id: "ESS-10",
    domain: "Staff & Professionalism",
    field: "respectShown",
    text: "How satisfied were you with the respect shown to you during your visit?"
  },
  // ─── Care Quality (3) ───────────────────────────────────
  {
    id: "ESS-11",
    domain: "Care Quality",
    field: "involvementInDecisions",
    text: "How satisfied were you with your involvement in decisions about your care?"
  },
  {
    id: "ESS-12",
    domain: "Care Quality",
    field: "treatmentPlanExplanation",
    text: "How satisfied were you with how well the treatment plan was explained?"
  },
  {
    id: "ESS-13",
    domain: "Care Quality",
    field: "confidenceInCare",
    text: "How confident were you in the care you received?"
  },
  // ─── Environment (3) ────────────────────────────────────
  {
    id: "ESS-14",
    domain: "Environment",
    field: "cleanliness",
    text: "How satisfied were you with the cleanliness of the facility?"
  },
  {
    id: "ESS-15",
    domain: "Environment",
    field: "waitingAreaComfort",
    text: "How satisfied were you with the comfort of the waiting area?"
  },
  {
    id: "ESS-16",
    domain: "Environment",
    field: "privacy",
    text: "How satisfied were you with the privacy provided during your visit?"
  },
  // ─── Overall Satisfaction (3) ───────────────────────────
  {
    id: "ESS-17",
    domain: "Overall Satisfaction",
    field: "overallRating",
    text: "How would you rate your overall satisfaction with this visit?"
  },
  {
    id: "ESS-18",
    domain: "Overall Satisfaction",
    field: "likelyToRecommend",
    text: "How likely are you to recommend this provider to others?"
  },
  {
    id: "ESS-19",
    domain: "Overall Satisfaction",
    field: "likelyToReturn",
    text: "How likely are you to return to this provider for future care?"
  }
];
const likertResponseOptions = [
  { value: 1, label: "Very Dissatisfied" },
  { value: 2, label: "Dissatisfied" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Satisfied" },
  { value: 5, label: "Very Satisfied" }
];
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
    $$renderer.push(`<button type="button" class="rounded-lg bg-primary px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark">Submit Survey</button>`);
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
function Step2VisitInformation($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const v = assessment.data.visitInformation;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Visit Information",
        description: "Details about your recent healthcare visit",
        children: ($$renderer4) => {
          TextInput($$renderer4, {
            label: "Visit Date",
            name: "visitDate",
            type: "date",
            required: true,
            get value() {
              return v.visitDate;
            },
            set value($$value) {
              v.visitDate = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Department / Clinic",
            name: "department",
            placeholder: "e.g. Primary Care, Cardiology",
            required: true,
            get value() {
              return v.department;
            },
            set value($$value) {
              v.department = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Provider Name",
            name: "providerName",
            placeholder: "e.g. Dr. Smith",
            required: true,
            get value() {
              return v.providerName;
            },
            set value($$value) {
              v.providerName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Visit Type",
            name: "visitType",
            options: [
              { value: "routine-checkup", label: "Routine Check-up" },
              { value: "follow-up", label: "Follow-up Visit" },
              { value: "urgent-care", label: "Urgent Care" },
              { value: "specialist-referral", label: "Specialist Referral" },
              { value: "procedure", label: "Procedure" },
              { value: "other", label: "Other" }
            ],
            required: true,
            get value() {
              return v.visitType;
            },
            set value($$value) {
              v.visitType = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Reason for Visit",
            name: "reasonForVisit",
            placeholder: "Briefly describe the reason for your visit",
            get value() {
              return v.reasonForVisit;
            },
            set value($$value) {
              v.reasonForVisit = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Was this your first visit to this provider?",
            name: "firstVisit",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            required: true,
            get value() {
              return v.firstVisit;
            },
            set value($$value) {
              v.firstVisit = $$value;
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
function Step3AccessScheduling($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const section = assessment.data.accessScheduling;
    const questions = satisfactionQuestions.filter((q) => q.domain === "Access & Scheduling");
    SectionCard($$renderer2, {
      title: "Access & Scheduling",
      description: "Rate your satisfaction with appointment access and wait times",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(questions);
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let question = each_array[i];
          $$renderer3.push(`<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0"><p class="mb-3 text-sm font-medium text-gray-700"><span class="mr-1 font-bold text-primary">${escape_html(i + 1)}.</span> ${escape_html(question.text)}</p> <div class="flex flex-wrap gap-2"><!--[-->`);
          const each_array_1 = ensure_array_like(likertResponseOptions);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let opt = each_array_1[$$index];
            $$renderer3.push(`<label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${stringify(section[question.field] === opt.value ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `ess-${stringify(question.id)}`)}${attr("value", opt.value)}${attr("checked", section[question.field] === opt.value, true)} class="text-primary accent-primary"/> ${escape_html(opt.label)}</label>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step4Communication($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const section = assessment.data.communication;
    const questions = satisfactionQuestions.filter((q) => q.domain === "Communication");
    SectionCard($$renderer2, {
      title: "Communication",
      description: "Rate your satisfaction with provider communication",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(questions);
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let question = each_array[i];
          $$renderer3.push(`<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0"><p class="mb-3 text-sm font-medium text-gray-700"><span class="mr-1 font-bold text-primary">${escape_html(i + 1)}.</span> ${escape_html(question.text)}</p> <div class="flex flex-wrap gap-2"><!--[-->`);
          const each_array_1 = ensure_array_like(likertResponseOptions);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let opt = each_array_1[$$index];
            $$renderer3.push(`<label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${stringify(section[question.field] === opt.value ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `ess-${stringify(question.id)}`)}${attr("value", opt.value)}${attr("checked", section[question.field] === opt.value, true)} class="text-primary accent-primary"/> ${escape_html(opt.label)}</label>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step5StaffProfessionalism($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const section = assessment.data.staffProfessionalism;
    const questions = satisfactionQuestions.filter((q) => q.domain === "Staff & Professionalism");
    SectionCard($$renderer2, {
      title: "Staff & Professionalism",
      description: "Rate your satisfaction with staff interactions",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(questions);
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let question = each_array[i];
          $$renderer3.push(`<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0"><p class="mb-3 text-sm font-medium text-gray-700"><span class="mr-1 font-bold text-primary">${escape_html(i + 1)}.</span> ${escape_html(question.text)}</p> <div class="flex flex-wrap gap-2"><!--[-->`);
          const each_array_1 = ensure_array_like(likertResponseOptions);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let opt = each_array_1[$$index];
            $$renderer3.push(`<label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${stringify(section[question.field] === opt.value ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `ess-${stringify(question.id)}`)}${attr("value", opt.value)}${attr("checked", section[question.field] === opt.value, true)} class="text-primary accent-primary"/> ${escape_html(opt.label)}</label>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step6CareQuality($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const section = assessment.data.careQuality;
    const questions = satisfactionQuestions.filter((q) => q.domain === "Care Quality");
    SectionCard($$renderer2, {
      title: "Care Quality",
      description: "Rate your satisfaction with the quality of care received",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(questions);
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let question = each_array[i];
          $$renderer3.push(`<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0"><p class="mb-3 text-sm font-medium text-gray-700"><span class="mr-1 font-bold text-primary">${escape_html(i + 1)}.</span> ${escape_html(question.text)}</p> <div class="flex flex-wrap gap-2"><!--[-->`);
          const each_array_1 = ensure_array_like(likertResponseOptions);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let opt = each_array_1[$$index];
            $$renderer3.push(`<label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${stringify(section[question.field] === opt.value ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `ess-${stringify(question.id)}`)}${attr("value", opt.value)}${attr("checked", section[question.field] === opt.value, true)} class="text-primary accent-primary"/> ${escape_html(opt.label)}</label>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step7Environment($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const section = assessment.data.environment;
    const questions = satisfactionQuestions.filter((q) => q.domain === "Environment");
    SectionCard($$renderer2, {
      title: "Environment",
      description: "Rate your satisfaction with the facility environment",
      children: ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(questions);
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let question = each_array[i];
          $$renderer3.push(`<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0"><p class="mb-3 text-sm font-medium text-gray-700"><span class="mr-1 font-bold text-primary">${escape_html(i + 1)}.</span> ${escape_html(question.text)}</p> <div class="flex flex-wrap gap-2"><!--[-->`);
          const each_array_1 = ensure_array_like(likertResponseOptions);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let opt = each_array_1[$$index];
            $$renderer3.push(`<label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${stringify(section[question.field] === opt.value ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `ess-${stringify(question.id)}`)}${attr("value", opt.value)}${attr("checked", section[question.field] === opt.value, true)} class="text-primary accent-primary"/> ${escape_html(opt.label)}</label>`);
          }
          $$renderer3.push(`<!--]--></div></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      }
    });
  });
}
function Step8OverallSatisfaction($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const section = assessment.data.overallSatisfaction;
    const questions = satisfactionQuestions.filter((q) => q.domain === "Overall Satisfaction");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Overall Satisfaction",
        description: "Rate your overall experience and provide any additional comments",
        children: ($$renderer4) => {
          $$renderer4.push(`<!--[-->`);
          const each_array = ensure_array_like(questions);
          for (let i = 0, $$length = each_array.length; i < $$length; i++) {
            let question = each_array[i];
            $$renderer4.push(`<div class="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0"><p class="mb-3 text-sm font-medium text-gray-700"><span class="mr-1 font-bold text-primary">${escape_html(i + 1)}.</span> ${escape_html(question.text)}</p> <div class="flex flex-wrap gap-2"><!--[-->`);
            const each_array_1 = ensure_array_like(likertResponseOptions);
            for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
              let opt = each_array_1[$$index];
              $$renderer4.push(`<label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${stringify(section[question.field] === opt.value ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="radio"${attr("name", `ess-${stringify(question.id)}`)}${attr("value", opt.value)}${attr("checked", section[question.field] === opt.value, true)} class="text-primary accent-primary"/> ${escape_html(opt.label)}</label>`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
          }
          $$renderer4.push(`<!--]--> `);
          TextArea($$renderer4, {
            label: "Additional Comments",
            name: "comments",
            placeholder: "Please share any additional feedback about your experience...",
            rows: 4,
            get value() {
              return section.comments;
            },
            set value($$value) {
              section.comments = $$value;
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
        Step2VisitInformation($$renderer2);
      } else if (stepNumber() === 3) {
        $$renderer2.push("<!--[2-->");
        Step3AccessScheduling($$renderer2);
      } else if (stepNumber() === 4) {
        $$renderer2.push("<!--[3-->");
        Step4Communication($$renderer2);
      } else if (stepNumber() === 5) {
        $$renderer2.push("<!--[4-->");
        Step5StaffProfessionalism($$renderer2);
      } else if (stepNumber() === 6) {
        $$renderer2.push("<!--[5-->");
        Step6CareQuality($$renderer2);
      } else if (stepNumber() === 7) {
        $$renderer2.push("<!--[6-->");
        Step7Environment($$renderer2);
      } else if (stepNumber() === 8) {
        $$renderer2.push("<!--[7-->");
        Step8OverallSatisfaction($$renderer2);
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
