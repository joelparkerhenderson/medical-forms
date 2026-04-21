import { g as getContext, a as attr, e as escape_html, f as bind_props, i as ensure_array_like, j as attr_class, c as stringify, d as derived, k as store_get, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import { a as assessment } from "../../../../chunks/assessment.svelte.js";
import { s as steps, g as getVisibleSteps, a as getNextStep, b as getPrevStep } from "../../../../chunks/steps.js";
import { b as bmiCategory } from "../../../../chunks/utils2.js";
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
function NumberInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      label,
      name,
      value = null,
      min,
      max,
      step = 1,
      unit = "",
      required = false
    } = $$props;
    $$renderer2.push(`<div class="mb-4"><label${attr("for", name)} class="mb-1 block text-sm font-medium text-gray-700">${escape_html(label)} `);
    if (unit) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-gray-500">(${escape_html(unit)})</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (required) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-red-500">*</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></label> <input${attr("id", name)}${attr("name", name)} type="number"${attr("min", min)}${attr("max", max)}${attr("step", step)}${attr("required", required, true)}${attr("value", value ?? "")} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"/></div>`);
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
          $$renderer4.push(`<!----> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">`);
          NumberInput($$renderer4, {
            label: "Weight",
            name: "weight",
            unit: "kg",
            min: 1,
            max: 400,
            required: true,
            get value() {
              return d.weight;
            },
            set value($$value) {
              d.weight = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          NumberInput($$renderer4, {
            label: "Height",
            name: "height",
            unit: "cm",
            min: 50,
            max: 250,
            required: true,
            get value() {
              return d.height;
            },
            set value($$value) {
              d.height = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="mb-4"><span class="mb-1 block text-sm font-medium text-gray-700">BMI</span> <div class="flex h-[38px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm">`);
          if (d.bmi) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<span class="font-medium">${escape_html(d.bmi)}</span> <span class="ml-2 text-gray-500">(${escape_html(bmiCategory(d.bmi))})</span>`);
          } else {
            $$renderer4.push("<!--[-1-->");
            $$renderer4.push(`<span class="text-gray-400">Auto-calculated</span>`);
          }
          $$renderer4.push(`<!--]--></div></div></div> `);
          TextInput($$renderer4, {
            label: "Planned Procedure",
            name: "procedure",
            required: true,
            get value() {
              return d.plannedProcedure;
            },
            set value($$value) {
              d.plannedProcedure = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Procedure Urgency",
            name: "urgency",
            options: [
              { value: "elective", label: "Elective" },
              { value: "urgent", label: "Urgent" },
              { value: "emergency", label: "Emergency" }
            ],
            required: true,
            get value() {
              return d.procedureUrgency;
            },
            set value($$value) {
              d.procedureUrgency = $$value;
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
function Step2Cardiovascular($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const c = assessment.data.cardiovascular;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Cardiovascular",
        description: "Heart and blood vessel conditions",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Do you have high blood pressure (hypertension)?",
            name: "htn",
            options: yesNo,
            get value() {
              return c.hypertension;
            },
            set value($$value) {
              c.hypertension = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (c.hypertension === "yes") {
            $$renderer4.push("<!--[0-->");
            RadioGroup($$renderer4, {
              label: "Is it well controlled with medication?",
              name: "htnCtrl",
              options: yesNo,
              required: true,
              get value() {
                return c.hypertensionControlled;
              },
              set value($$value) {
                c.hypertensionControlled = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have ischaemic heart disease (angina, previous heart attack)?",
            name: "ihd",
            options: yesNo,
            get value() {
              return c.ischemicHeartDisease;
            },
            set value($$value) {
              c.ischemicHeartDisease = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (c.ischemicHeartDisease === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "ihdDetails",
              get value() {
                return c.ihdDetails;
              },
              set value($$value) {
                c.ihdDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have heart failure?",
            name: "hf",
            options: yesNo,
            get value() {
              return c.heartFailure;
            },
            set value($$value) {
              c.heartFailure = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (c.heartFailure === "yes") {
            $$renderer4.push("<!--[0-->");
            SelectInput($$renderer4, {
              label: "NYHA Class",
              name: "nyha",
              options: [
                { value: "1", label: "Class I - No limitation" },
                { value: "2", label: "Class II - Mild limitation" },
                { value: "3", label: "Class III - Marked limitation" },
                { value: "4", label: "Class IV - Severe limitation" }
              ],
              required: true,
              get value() {
                return c.heartFailureNYHA;
              },
              set value($$value) {
                c.heartFailureNYHA = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have any heart valve problems?",
            name: "valve",
            options: yesNo,
            get value() {
              return c.valvularDisease;
            },
            set value($$value) {
              c.valvularDisease = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (c.valvularDisease === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "valveDetails",
              get value() {
                return c.valvularDetails;
              },
              set value($$value) {
                c.valvularDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have an irregular heartbeat (arrhythmia)?",
            name: "arrhy",
            options: yesNo,
            get value() {
              return c.arrhythmia;
            },
            set value($$value) {
              c.arrhythmia = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (c.arrhythmia === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Type of arrhythmia",
              name: "arrhyType",
              get value() {
                return c.arrhythmiaType;
              },
              set value($$value) {
                c.arrhythmiaType = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have a pacemaker or defibrillator?",
            name: "pacemaker",
            options: yesNo,
            get value() {
              return c.pacemaker;
            },
            set value($$value) {
              c.pacemaker = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Have you had a heart attack in the last 6 months?",
            name: "recentMI",
            options: yesNo,
            get value() {
              return c.recentMI;
            },
            set value($$value) {
              c.recentMI = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (c.recentMI === "yes") {
            $$renderer4.push("<!--[0-->");
            NumberInput($$renderer4, {
              label: "How many weeks ago?",
              name: "miWeeks",
              min: 0,
              max: 26,
              required: true,
              get value() {
                return c.recentMIWeeks;
              },
              set value($$value) {
                c.recentMIWeeks = $$value;
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
function Step3Respiratory($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const r = assessment.data.respiratory;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Respiratory",
        description: "Lung and breathing conditions",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Do you have asthma?",
            name: "asthma",
            options: yesNo,
            get value() {
              return r.asthma;
            },
            set value($$value) {
              r.asthma = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (r.asthma === "yes") {
            $$renderer4.push("<!--[0-->");
            SelectInput($$renderer4, {
              label: "How frequent are your symptoms?",
              name: "asthmaFreq",
              options: [
                { value: "intermittent", label: "Intermittent" },
                { value: "mild-persistent", label: "Mild persistent" },
                { value: "moderate-persistent", label: "Moderate persistent" },
                { value: "severe-persistent", label: "Severe persistent" }
              ],
              required: true,
              get value() {
                return r.asthmaFrequency;
              },
              set value($$value) {
                r.asthmaFrequency = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have COPD (chronic bronchitis / emphysema)?",
            name: "copd",
            options: yesNo,
            get value() {
              return r.copd;
            },
            set value($$value) {
              r.copd = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (r.copd === "yes") {
            $$renderer4.push("<!--[0-->");
            SelectInput($$renderer4, {
              label: "COPD Severity",
              name: "copdSev",
              options: [
                { value: "mild", label: "Mild" },
                { value: "moderate", label: "Moderate" },
                { value: "severe", label: "Severe" }
              ],
              required: true,
              get value() {
                return r.copdSeverity;
              },
              set value($$value) {
                r.copdSeverity = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have obstructive sleep apnoea (OSA)?",
            name: "osa",
            options: yesNo,
            get value() {
              return r.osa;
            },
            set value($$value) {
              r.osa = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (r.osa === "yes") {
            $$renderer4.push("<!--[0-->");
            RadioGroup($$renderer4, {
              label: "Do you use a CPAP machine?",
              name: "cpap",
              options: yesNo,
              get value() {
                return r.osaCPAP;
              },
              set value($$value) {
                r.osaCPAP = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you smoke?",
            name: "smoking",
            options: [
              { value: "current", label: "Current smoker" },
              { value: "ex", label: "Ex-smoker" },
              { value: "never", label: "Never smoked" }
            ],
            get value() {
              return r.smoking;
            },
            set value($$value) {
              r.smoking = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (r.smoking === "current" || r.smoking === "ex") {
            $$renderer4.push("<!--[0-->");
            NumberInput($$renderer4, {
              label: "Pack-years",
              name: "packYears",
              min: 0,
              max: 200,
              get value() {
                return r.smokingPackYears;
              },
              set value($$value) {
                r.smokingPackYears = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Have you had a recent upper respiratory tract infection (cold/flu)?",
            name: "urti",
            options: yesNo,
            get value() {
              return r.recentURTI;
            },
            set value($$value) {
              r.recentURTI = $$value;
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
function Step4Renal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const r = assessment.data.renal;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Renal",
        description: "Kidney conditions",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Do you have chronic kidney disease?",
            name: "ckd",
            options: yesNo,
            get value() {
              return r.ckd;
            },
            set value($$value) {
              r.ckd = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (r.ckd === "yes") {
            $$renderer4.push("<!--[0-->");
            SelectInput($$renderer4, {
              label: "CKD Stage",
              name: "ckdStage",
              options: [
                { value: "1", label: "Stage 1" },
                { value: "2", label: "Stage 2" },
                { value: "3", label: "Stage 3" },
                { value: "4", label: "Stage 4" },
                { value: "5", label: "Stage 5" }
              ],
              required: true,
              get value() {
                return r.ckdStage;
              },
              set value($$value) {
                r.ckdStage = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Are you on dialysis?",
            name: "dialysis",
            options: yesNo,
            get value() {
              return r.dialysis;
            },
            set value($$value) {
              r.dialysis = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (r.dialysis === "yes") {
            $$renderer4.push("<!--[0-->");
            SelectInput($$renderer4, {
              label: "Dialysis Type",
              name: "dialysisType",
              options: [
                { value: "haemodialysis", label: "Haemodialysis" },
                { value: "peritoneal", label: "Peritoneal dialysis" }
              ],
              required: true,
              get value() {
                return r.dialysisType;
              },
              set value($$value) {
                r.dialysisType = $$value;
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
function Step5Hepatic($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const h = assessment.data.hepatic;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Hepatic",
        description: "Liver conditions",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Do you have liver disease?",
            name: "liver",
            options: yesNo,
            get value() {
              return h.liverDisease;
            },
            set value($$value) {
              h.liverDisease = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (h.liverDisease === "yes") {
            $$renderer4.push("<!--[0-->");
            RadioGroup($$renderer4, {
              label: "Do you have cirrhosis?",
              name: "cirrhosis",
              options: yesNo,
              get value() {
                return h.cirrhosis;
              },
              set value($$value) {
                h.cirrhosis = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            if (h.cirrhosis === "yes") {
              $$renderer4.push("<!--[0-->");
              SelectInput($$renderer4, {
                label: "Child-Pugh Score",
                name: "childPugh",
                options: [
                  { value: "A", label: "A - Well compensated" },
                  { value: "B", label: "B - Significant compromise" },
                  { value: "C", label: "C - Decompensated" }
                ],
                required: true,
                get value() {
                  return h.childPughScore;
                },
                set value($$value) {
                  h.childPughScore = $$value;
                  $$settled = false;
                }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have hepatitis?",
            name: "hepatitis",
            options: yesNo,
            get value() {
              return h.hepatitis;
            },
            set value($$value) {
              h.hepatitis = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (h.hepatitis === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Type (e.g. A, B, C)",
              name: "hepType",
              get value() {
                return h.hepatitisType;
              },
              set value($$value) {
                h.hepatitisType = $$value;
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
function Step6Endocrine($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const e = assessment.data.endocrine;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Endocrine",
        description: "Hormonal conditions",
        children: ($$renderer4) => {
          SelectInput($$renderer4, {
            label: "Do you have diabetes?",
            name: "diabetes",
            options: [
              { value: "none", label: "No" },
              { value: "type1", label: "Type 1" },
              { value: "type2", label: "Type 2" },
              { value: "gestational", label: "Gestational" }
            ],
            get value() {
              return e.diabetes;
            },
            set value($$value) {
              e.diabetes = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (e.diabetes && e.diabetes !== "none") {
            $$renderer4.push("<!--[0-->");
            SelectInput($$renderer4, {
              label: "How well controlled is your diabetes?",
              name: "diabetesCtrl",
              options: [
                { value: "well-controlled", label: "Well controlled" },
                { value: "poorly-controlled", label: "Poorly controlled" }
              ],
              required: true,
              get value() {
                return e.diabetesControl;
              },
              set value($$value) {
                e.diabetesControl = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            RadioGroup($$renderer4, {
              label: "Are you on insulin?",
              name: "insulin",
              options: yesNo,
              get value() {
                return e.diabetesOnInsulin;
              },
              set value($$value) {
                e.diabetesOnInsulin = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have thyroid disease?",
            name: "thyroid",
            options: yesNo,
            get value() {
              return e.thyroidDisease;
            },
            set value($$value) {
              e.thyroidDisease = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (e.thyroidDisease === "yes") {
            $$renderer4.push("<!--[0-->");
            SelectInput($$renderer4, {
              label: "Thyroid condition",
              name: "thyroidType",
              options: [
                { value: "hypothyroid", label: "Underactive (hypothyroid)" },
                { value: "hyperthyroid", label: "Overactive (hyperthyroid)" }
              ],
              required: true,
              get value() {
                return e.thyroidType;
              },
              set value($$value) {
                e.thyroidType = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have adrenal insufficiency?",
            name: "adrenal",
            options: yesNo,
            get value() {
              return e.adrenalInsufficiency;
            },
            set value($$value) {
              e.adrenalInsufficiency = $$value;
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
function Step7Neurological($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const n = assessment.data.neurological;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Neurological",
        description: "Brain and nerve conditions",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Have you had a stroke or TIA (mini-stroke)?",
            name: "stroke",
            options: yesNo,
            get value() {
              return n.strokeOrTIA;
            },
            set value($$value) {
              n.strokeOrTIA = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (n.strokeOrTIA === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details (when, residual effects)",
              name: "strokeDetails",
              get value() {
                return n.strokeDetails;
              },
              set value($$value) {
                n.strokeDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have epilepsy?",
            name: "epilepsy",
            options: yesNo,
            get value() {
              return n.epilepsy;
            },
            set value($$value) {
              n.epilepsy = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (n.epilepsy === "yes") {
            $$renderer4.push("<!--[0-->");
            RadioGroup($$renderer4, {
              label: "Is your epilepsy well controlled?",
              name: "epilepsyCtrl",
              options: yesNo,
              required: true,
              get value() {
                return n.epilepsyControlled;
              },
              set value($$value) {
                n.epilepsyControlled = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have any neuromuscular disease (e.g. MS, MND, myasthenia)?",
            name: "neuromusc",
            options: yesNo,
            get value() {
              return n.neuromuscularDisease;
            },
            set value($$value) {
              n.neuromuscularDisease = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (n.neuromuscularDisease === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "neuroDetails",
              get value() {
                return n.neuromuscularDetails;
              },
              set value($$value) {
                n.neuromuscularDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have raised intracranial pressure?",
            name: "icp",
            options: yesNo,
            get value() {
              return n.raisedICP;
            },
            set value($$value) {
              n.raisedICP = $$value;
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
function Step8Haematological($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const h = assessment.data.haematological;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Haematological",
        description: "Blood and clotting conditions",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Do you have a bleeding disorder?",
            name: "bleeding",
            options: yesNo,
            get value() {
              return h.bleedingDisorder;
            },
            set value($$value) {
              h.bleedingDisorder = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (h.bleedingDisorder === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "bleedDetails",
              get value() {
                return h.bleedingDetails;
              },
              set value($$value) {
                h.bleedingDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Are you taking blood thinners (anticoagulants/antiplatelets)?",
            name: "anticoag",
            options: yesNo,
            get value() {
              return h.onAnticoagulants;
            },
            set value($$value) {
              h.onAnticoagulants = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (h.onAnticoagulants === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Which medication? (e.g. warfarin, rivaroxaban, clopidogrel)",
              name: "anticoagType",
              get value() {
                return h.anticoagulantType;
              },
              set value($$value) {
                h.anticoagulantType = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have sickle cell disease?",
            name: "sickle",
            options: yesNo,
            get value() {
              return h.sickleCellDisease;
            },
            set value($$value) {
              h.sickleCellDisease = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (h.sickleCellDisease !== "yes") {
            $$renderer4.push("<!--[0-->");
            RadioGroup($$renderer4, {
              label: "Do you carry the sickle cell trait?",
              name: "sickleTrait",
              options: yesNo,
              get value() {
                return h.sickleCellTrait;
              },
              set value($$value) {
                h.sickleCellTrait = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you have anaemia?",
            name: "anaemia",
            options: yesNo,
            get value() {
              return h.anaemia;
            },
            set value($$value) {
              h.anaemia = $$value;
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
function Step9MusculoskeletalAirway($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const m = assessment.data.musculoskeletalAirway;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Musculoskeletal & Airway",
        description: "Joint, spine and airway assessment",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Do you have rheumatoid arthritis?",
            name: "ra",
            options: yesNo,
            get value() {
              return m.rheumatoidArthritis;
            },
            set value($$value) {
              m.rheumatoidArthritis = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Do you have any cervical spine (neck) problems?",
            name: "cspine",
            options: yesNo,
            get value() {
              return m.cervicalSpineIssues;
            },
            set value($$value) {
              m.cervicalSpineIssues = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Do you have limited neck movement?",
            name: "neckMov",
            options: yesNo,
            get value() {
              return m.limitedNeckMovement;
            },
            set value($$value) {
              m.limitedNeckMovement = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Do you have limited mouth opening?",
            name: "mouthOpen",
            options: yesNo,
            get value() {
              return m.limitedMouthOpening;
            },
            set value($$value) {
              m.limitedMouthOpening = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Do you have any dental issues (loose/capped teeth, dentures)?",
            name: "dental",
            options: yesNo,
            get value() {
              return m.dentalIssues;
            },
            set value($$value) {
              m.dentalIssues = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (m.dentalIssues === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "dentalDetails",
              get value() {
                return m.dentalDetails;
              },
              set value($$value) {
                m.dentalDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Have you ever been told you had a difficult airway?",
            name: "diffAirway",
            options: yesNo,
            get value() {
              return m.previousDifficultAirway;
            },
            set value($$value) {
              m.previousDifficultAirway = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Mallampati Score (if known)",
            name: "mallampati",
            options: [
              { value: "1", label: "Class 1" },
              { value: "2", label: "Class 2" },
              { value: "3", label: "Class 3" },
              { value: "4", label: "Class 4" }
            ],
            get value() {
              return m.mallampatiScore;
            },
            set value($$value) {
              m.mallampatiScore = $$value;
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
function Step10Gastrointestinal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const g = assessment.data.gastrointestinal;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Gastrointestinal",
        description: "Stomach and digestive conditions",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Do you suffer from acid reflux / GORD?",
            name: "gord",
            options: yesNo,
            get value() {
              return g.gord;
            },
            set value($$value) {
              g.gord = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Do you have a hiatus hernia?",
            name: "hiatus",
            options: yesNo,
            get value() {
              return g.hiatusHernia;
            },
            set value($$value) {
              g.hiatusHernia = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Do you often feel nauseous or vomit?",
            name: "nausea",
            options: yesNo,
            get value() {
              return g.nausea;
            },
            set value($$value) {
              g.nausea = $$value;
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
function MedicationEntry($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { medications = [] } = $$props;
    $$renderer2.push(`<div class="space-y-3"><!--[-->`);
    const each_array = ensure_array_like(medications);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let med = each_array[i];
      $$renderer2.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3"><input type="text" placeholder="Medication name"${attr("value", med.name)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Dose"${attr("value", med.dose)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Frequency"${attr("value", med.frequency)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove medication">×</button></div>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Medication</button></div>`);
    bind_props($$props, { medications });
  });
}
function Step11Medications($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Medications",
        description: "List all medications you currently take, including over-the-counter",
        children: ($$renderer4) => {
          MedicationEntry($$renderer4, {
            get medications() {
              return assessment.data.medications;
            },
            set medications($$value) {
              assessment.data.medications = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (assessment.data.medications.length === 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<p class="mt-3 text-sm text-gray-500">No medications added. Click the button above to add one, or proceed to next step if you take none.</p>`);
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
function AllergyEntry($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { allergies = [] } = $$props;
    const severityOptions = [
      { value: "mild", label: "Mild" },
      { value: "moderate", label: "Moderate" },
      { value: "anaphylaxis", label: "Anaphylaxis" }
    ];
    $$renderer2.push(`<div class="space-y-3"><!--[-->`);
    const each_array = ensure_array_like(allergies);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let allergy = each_array[i];
      $$renderer2.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3"><input type="text" placeholder="Allergen"${attr("value", allergy.allergen)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Reaction"${attr("value", allergy.reaction)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> `);
      $$renderer2.select(
        {
          value: allergy.severity,
          class: "rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Severity`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(severityOptions);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let opt = each_array_1[$$index];
            $$renderer3.option({ value: opt.value }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(opt.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove allergy">×</button></div>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Allergy</button></div>`);
    bind_props($$props, { allergies });
  });
}
function Step12Allergies($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Allergies",
        description: "List any known allergies (medications, latex, foods, etc.)",
        children: ($$renderer4) => {
          AllergyEntry($$renderer4, {
            get allergies() {
              return assessment.data.allergies;
            },
            set allergies($$value) {
              assessment.data.allergies = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (assessment.data.allergies.length === 0) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<p class="mt-3 text-sm text-gray-500">No allergies added. Click the button above to add one, or proceed to next step if you have none.</p>`);
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
function Step13PreviousAnaesthesia($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const p = assessment.data.previousAnaesthesia;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Previous Anaesthesia",
        description: "Your experience with previous anaesthetics",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Have you had a general anaesthetic before?",
            name: "prevAnaes",
            options: yesNo,
            get value() {
              return p.previousAnaesthesia;
            },
            set value($$value) {
              p.previousAnaesthesia = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (p.previousAnaesthesia === "yes") {
            $$renderer4.push("<!--[0-->");
            RadioGroup($$renderer4, {
              label: "Were there any problems with the anaesthetic?",
              name: "anaesProblems",
              options: yesNo,
              get value() {
                return p.anaesthesiaProblems;
              },
              set value($$value) {
                p.anaesthesiaProblems = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            if (p.anaesthesiaProblems === "yes") {
              $$renderer4.push("<!--[0-->");
              TextInput($$renderer4, {
                label: "Please describe the problems",
                name: "anesProbDetails",
                get value() {
                  return p.anaesthesiaProblemDetails;
                },
                set value($$value) {
                  p.anaesthesiaProblemDetails = $$value;
                  $$settled = false;
                }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Has anyone in your family had problems with anaesthesia (malignant hyperthermia)?",
            name: "mhHistory",
            options: yesNo,
            get value() {
              return p.familyMHHistory;
            },
            set value($$value) {
              p.familyMHHistory = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (p.familyMHHistory === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "mhDetails",
              get value() {
                return p.familyMHDetails;
              },
              set value($$value) {
                p.familyMHDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you suffer from severe nausea/vomiting after anaesthesia (PONV)?",
            name: "ponv",
            options: yesNo,
            get value() {
              return p.ponv;
            },
            set value($$value) {
              p.ponv = $$value;
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
function Step14SocialHistory($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const s = assessment.data.socialHistory;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Social History",
        description: "Lifestyle factors relevant to anaesthesia",
        children: ($$renderer4) => {
          SelectInput($$renderer4, {
            label: "Alcohol consumption",
            name: "alcohol",
            options: [
              { value: "none", label: "None" },
              { value: "occasional", label: "Occasional (1-7 units/week)" },
              { value: "moderate", label: "Moderate (8-14 units/week)" },
              { value: "heavy", label: "Heavy (>14 units/week)" }
            ],
            get value() {
              return s.alcohol;
            },
            set value($$value) {
              s.alcohol = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (s.alcohol && s.alcohol !== "none") {
            $$renderer4.push("<!--[0-->");
            NumberInput($$renderer4, {
              label: "Units per week",
              name: "alcoholUnits",
              min: 0,
              max: 200,
              get value() {
                return s.alcoholUnitsPerWeek;
              },
              set value($$value) {
                s.alcoholUnitsPerWeek = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you use recreational drugs?",
            name: "drugs",
            options: yesNo,
            get value() {
              return s.recreationalDrugs;
            },
            set value($$value) {
              s.recreationalDrugs = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (s.recreationalDrugs === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details (substance, frequency)",
              name: "drugDetails",
              get value() {
                return s.drugDetails;
              },
              set value($$value) {
                s.drugDetails = $$value;
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
function Step15FunctionalCapacity($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const f = assessment.data.functionalCapacity;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Functional Capacity",
        description: "Your ability to perform daily activities and exercise",
        children: ($$renderer4) => {
          SelectInput($$renderer4, {
            label: "What is the most strenuous activity you can do without becoming short of breath?",
            name: "exercise",
            options: [
              { value: "unable", label: "Unable to perform daily activities" },
              {
                value: "light-housework",
                label: "Light housework / walking around the house"
              },
              {
                value: "climb-stairs",
                label: "Climb a flight of stairs / walk uphill"
              },
              {
                value: "moderate-exercise",
                label: "Moderate exercise (jogging, cycling)"
              },
              {
                value: "vigorous-exercise",
                label: "Vigorous exercise (running, swimming laps)"
              }
            ],
            get value() {
              return f.exerciseTolerance;
            },
            set value($$value) {
              f.exerciseTolerance = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (f.estimatedMETs !== null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">Estimated METs: <strong>${escape_html(f.estimatedMETs)}</strong> `);
            if (f.estimatedMETs < 4) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="ml-2 text-orange-600">(Poor functional capacity - &lt;4 METs)</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
              $$renderer4.push(`<span class="ml-2 text-green-600">(Adequate functional capacity - ≥4 METs)</span>`);
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Do you use any mobility aids (wheelchair, walker, stick)?",
            name: "mobilityAids",
            options: yesNo,
            get value() {
              return f.mobilityAids;
            },
            set value($$value) {
              f.mobilityAids = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Has your ability to exercise declined recently?",
            name: "recentDecline",
            options: yesNo,
            get value() {
              return f.recentDecline;
            },
            set value($$value) {
              f.recentDecline = $$value;
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
function Step16Pregnancy($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const p = assessment.data.pregnancy;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Pregnancy",
        description: "This section applies to females of childbearing age",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Is there any possibility you could be pregnant?",
            name: "possPregnant",
            options: yesNo,
            get value() {
              return p.possiblyPregnant;
            },
            set value($$value) {
              p.possiblyPregnant = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (p.possiblyPregnant === "yes") {
            $$renderer4.push("<!--[0-->");
            RadioGroup($$renderer4, {
              label: "Has pregnancy been confirmed?",
              name: "pregConfirmed",
              options: yesNo,
              get value() {
                return p.pregnancyConfirmed;
              },
              set value($$value) {
                p.pregnancyConfirmed = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            if (p.pregnancyConfirmed === "yes") {
              $$renderer4.push("<!--[0-->");
              NumberInput($$renderer4, {
                label: "Gestation",
                name: "gestWeeks",
                unit: "weeks",
                min: 1,
                max: 42,
                get value() {
                  return p.gestationWeeks;
                },
                set value($$value) {
                  p.gestationWeeks = $$value;
                  $$settled = false;
                }
              });
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]-->`);
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
    const visibleSteps = derived(() => getVisibleSteps(assessment.data));
    const isLast = derived(() => visibleSteps()[visibleSteps().length - 1]?.number === stepNumber());
    const nextStep = derived(() => getNextStep(stepNumber(), assessment.data));
    const prevStep = derived(() => getPrevStep(stepNumber(), assessment.data));
    const nextHref = derived(() => nextStep() ? `/assessment/${nextStep()}` : null);
    const prevHref = derived(() => prevStep() ? `/assessment/${prevStep()}` : null);
    if (stepConfig()) {
      $$renderer2.push("<!--[0-->");
      if (stepNumber() === 1) {
        $$renderer2.push("<!--[0-->");
        Step1Demographics($$renderer2);
      } else if (stepNumber() === 2) {
        $$renderer2.push("<!--[1-->");
        Step2Cardiovascular($$renderer2);
      } else if (stepNumber() === 3) {
        $$renderer2.push("<!--[2-->");
        Step3Respiratory($$renderer2);
      } else if (stepNumber() === 4) {
        $$renderer2.push("<!--[3-->");
        Step4Renal($$renderer2);
      } else if (stepNumber() === 5) {
        $$renderer2.push("<!--[4-->");
        Step5Hepatic($$renderer2);
      } else if (stepNumber() === 6) {
        $$renderer2.push("<!--[5-->");
        Step6Endocrine($$renderer2);
      } else if (stepNumber() === 7) {
        $$renderer2.push("<!--[6-->");
        Step7Neurological($$renderer2);
      } else if (stepNumber() === 8) {
        $$renderer2.push("<!--[7-->");
        Step8Haematological($$renderer2);
      } else if (stepNumber() === 9) {
        $$renderer2.push("<!--[8-->");
        Step9MusculoskeletalAirway($$renderer2);
      } else if (stepNumber() === 10) {
        $$renderer2.push("<!--[9-->");
        Step10Gastrointestinal($$renderer2);
      } else if (stepNumber() === 11) {
        $$renderer2.push("<!--[10-->");
        Step11Medications($$renderer2);
      } else if (stepNumber() === 12) {
        $$renderer2.push("<!--[11-->");
        Step12Allergies($$renderer2);
      } else if (stepNumber() === 13) {
        $$renderer2.push("<!--[12-->");
        Step13PreviousAnaesthesia($$renderer2);
      } else if (stepNumber() === 14) {
        $$renderer2.push("<!--[13-->");
        Step14SocialHistory($$renderer2);
      } else if (stepNumber() === 15) {
        $$renderer2.push("<!--[14-->");
        Step15FunctionalCapacity($$renderer2);
      } else if (stepNumber() === 16) {
        $$renderer2.push("<!--[15-->");
        Step16Pregnancy($$renderer2);
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
