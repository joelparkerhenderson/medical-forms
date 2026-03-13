import { g as getContext, a as attr, e as escape_html, f as bind_props, i as ensure_array_like, j as attr_class, c as stringify, d as derived, k as store_get, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import { s as steps, a as getNextStep, b as getPrevStep } from "../../../../chunks/steps.js";
import { c as casualtyCard } from "../../../../chunks/casualtyCard.svelte.js";
import { n as news2ResponseColor, a as news2ResponseLabel } from "../../../../chunks/utils2.js";
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
function scoreRespiratoryRate(rr) {
  if (rr === null) return { parameter: "Respiratory Rate", value: "N/A", score: 0 };
  let score = 0;
  if (rr <= 8) score = 3;
  else if (rr <= 11) score = 1;
  else if (rr <= 20) score = 0;
  else if (rr <= 24) score = 2;
  else score = 3;
  return { parameter: "Respiratory Rate", value: `${rr} /min`, score };
}
function scoreOxygenSaturation(spo2) {
  if (spo2 === null) return { parameter: "SpO2 (Scale 1)", value: "N/A", score: 0 };
  let score = 0;
  if (spo2 <= 91) score = 3;
  else if (spo2 <= 93) score = 2;
  else if (spo2 <= 95) score = 1;
  else score = 0;
  return { parameter: "SpO2 (Scale 1)", value: `${spo2}%`, score };
}
function scoreSystolicBP(sbp) {
  if (sbp === null) return { parameter: "Systolic BP", value: "N/A", score: 0 };
  let score = 0;
  if (sbp <= 90) score = 3;
  else if (sbp <= 100) score = 2;
  else if (sbp <= 110) score = 1;
  else if (sbp <= 219) score = 0;
  else score = 3;
  return { parameter: "Systolic BP", value: `${sbp} mmHg`, score };
}
function scorePulse(hr) {
  if (hr === null) return { parameter: "Pulse", value: "N/A", score: 0 };
  let score = 0;
  if (hr <= 40) score = 3;
  else if (hr <= 50) score = 1;
  else if (hr <= 90) score = 0;
  else if (hr <= 110) score = 1;
  else if (hr <= 130) score = 2;
  else score = 3;
  return { parameter: "Pulse", value: `${hr} bpm`, score };
}
function scoreConsciousness(level) {
  const score = level === "alert" || level === "" ? 0 : 3;
  return { parameter: "Consciousness", value: level || "N/A", score };
}
function scoreTemperature(temp) {
  if (temp === null) return { parameter: "Temperature", value: "N/A", score: 0 };
  let score = 0;
  if (temp <= 35) score = 3;
  else if (temp <= 36) score = 1;
  else if (temp <= 38) score = 0;
  else if (temp <= 39) score = 1;
  else score = 2;
  return { parameter: "Temperature", value: `${temp} °C`, score };
}
function scoreSupplementalOxygen(supplemental) {
  const score = supplemental === "yes" ? 2 : 0;
  return { parameter: "Supplemental O2", value: supplemental === "yes" ? "Yes" : "No", score };
}
function determineClinicalResponse(totalScore, hasAnySingleScore3) {
  if (totalScore >= 7) return "high";
  if (totalScore >= 5) return "medium";
  if (hasAnySingleScore3) return "low-medium";
  return "low";
}
function calculateNEWS2(vitals) {
  const parameterScores = [
    scoreRespiratoryRate(vitals.respiratoryRate),
    scoreOxygenSaturation(vitals.oxygenSaturation),
    scoreSystolicBP(vitals.systolicBP),
    scorePulse(vitals.heartRate),
    scoreConsciousness(vitals.consciousnessLevel),
    scoreTemperature(vitals.temperature),
    scoreSupplementalOxygen(vitals.supplementalOxygen)
  ];
  const totalScore = parameterScores.reduce((sum, p) => sum + p.score, 0);
  const hasAnySingleScore3 = parameterScores.some((p) => p.score === 3);
  const clinicalResponse = determineClinicalResponse(totalScore, hasAnySingleScore3);
  return { totalScore, parameterScores, clinicalResponse, hasAnySingleScore3 };
}
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
    const d = casualtyCard.data.demographics;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Patient Demographics",
        description: "Patient identification and contact details",
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
          $$renderer4.push(`<!----></div> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Date of Birth",
            name: "dateOfBirth",
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
          TextInput($$renderer4, {
            label: "NHS Number",
            name: "nhsNumber",
            placeholder: "000 000 0000",
            get value() {
              return d.nhsNumber;
            },
            set value($$value) {
              d.nhsNumber = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          RadioGroup($$renderer4, {
            label: "Sex",
            name: "sex",
            options: [
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" }
            ],
            get value() {
              return d.sex;
            },
            set value($$value) {
              d.sex = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Address",
            name: "address",
            get value() {
              return d.address;
            },
            set value($$value) {
              d.address = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Postcode",
            name: "postcode",
            get value() {
              return d.postcode;
            },
            set value($$value) {
              d.postcode = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Phone",
            name: "phone",
            type: "tel",
            get value() {
              return d.phone;
            },
            set value($$value) {
              d.phone = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          TextInput($$renderer4, {
            label: "Email",
            name: "email",
            type: "email",
            get value() {
              return d.email;
            },
            set value($$value) {
              d.email = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          SelectInput($$renderer4, {
            label: "Ethnicity",
            name: "ethnicity",
            options: [
              { value: "white-british", label: "White British" },
              { value: "white-irish", label: "White Irish" },
              { value: "white-other", label: "White Other" },
              {
                value: "mixed-white-black-caribbean",
                label: "Mixed - White & Black Caribbean"
              },
              {
                value: "mixed-white-black-african",
                label: "Mixed - White & Black African"
              },
              { value: "mixed-white-asian", label: "Mixed - White & Asian" },
              { value: "mixed-other", label: "Mixed Other" },
              { value: "asian-indian", label: "Asian Indian" },
              { value: "asian-pakistani", label: "Asian Pakistani" },
              { value: "asian-bangladeshi", label: "Asian Bangladeshi" },
              { value: "asian-chinese", label: "Asian Chinese" },
              { value: "asian-other", label: "Asian Other" },
              { value: "black-african", label: "Black African" },
              { value: "black-caribbean", label: "Black Caribbean" },
              { value: "black-other", label: "Black Other" },
              { value: "other", label: "Other" },
              { value: "not-stated", label: "Not Stated" }
            ],
            get value() {
              return d.ethnicity;
            },
            set value($$value) {
              d.ethnicity = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Preferred Language",
            name: "preferredLanguage",
            get value() {
              return d.preferredLanguage;
            },
            set value($$value) {
              d.preferredLanguage = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          RadioGroup($$renderer4, {
            label: "Interpreter Required?",
            name: "interpreterRequired",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return d.interpreterRequired;
            },
            set value($$value) {
              d.interpreterRequired = $$value;
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
function Step2NextOfKinGP($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const nok = casualtyCard.data.nextOfKinGP.nextOfKin;
    const gp = casualtyCard.data.nextOfKinGP.gp;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Next of Kin & GP",
        description: "Emergency contact and GP details",
        children: ($$renderer4) => {
          $$renderer4.push(`<h3 class="mb-3 text-lg font-semibold text-gray-800">Next of Kin</h3> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Name",
            name: "nokName",
            get value() {
              return nok.name;
            },
            set value($$value) {
              nok.name = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Relationship",
            name: "nokRelationship",
            get value() {
              return nok.relationship;
            },
            set value($$value) {
              nok.relationship = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          TextInput($$renderer4, {
            label: "Phone",
            name: "nokPhone",
            type: "tel",
            get value() {
              return nok.phone;
            },
            set value($$value) {
              nok.phone = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Next of Kin Notified?",
            name: "nokNotified",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return nok.notified;
            },
            set value($$value) {
              nok.notified = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">General Practitioner</h3> `);
          TextInput($$renderer4, {
            label: "GP Name",
            name: "gpName",
            get value() {
              return gp.name;
            },
            set value($$value) {
              gp.name = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Practice Name",
            name: "gpPracticeName",
            get value() {
              return gp.practiceName;
            },
            set value($$value) {
              gp.practiceName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Practice Address",
            name: "gpPracticeAddress",
            get value() {
              return gp.practiceAddress;
            },
            set value($$value) {
              gp.practiceAddress = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Practice Phone",
            name: "gpPracticePhone",
            type: "tel",
            get value() {
              return gp.practicePhone;
            },
            set value($$value) {
              gp.practicePhone = $$value;
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
function Step3ArrivalTriage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const t = casualtyCard.data.arrivalTriage;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Arrival & Triage",
        description: "Attendance details and Manchester Triage System assessment",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Attendance Date",
            name: "attendanceDate",
            type: "date",
            get value() {
              return t.attendanceDate;
            },
            set value($$value) {
              t.attendanceDate = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Arrival Time",
            name: "arrivalTime",
            type: "time",
            get value() {
              return t.arrivalTime;
            },
            set value($$value) {
              t.arrivalTime = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          RadioGroup($$renderer4, {
            label: "Attendance Category",
            name: "attendanceCategory",
            options: [
              { value: "first", label: "First" },
              { value: "follow-up", label: "Follow-up" },
              { value: "planned", label: "Planned" },
              { value: "unplanned", label: "Unplanned" }
            ],
            get value() {
              return t.attendanceCategory;
            },
            set value($$value) {
              t.attendanceCategory = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Arrival Mode",
            name: "arrivalMode",
            options: [
              { value: "ambulance", label: "Ambulance" },
              { value: "walk-in", label: "Walk-in" },
              { value: "helicopter", label: "Helicopter" },
              { value: "police", label: "Police" },
              { value: "other", label: "Other" }
            ],
            get value() {
              return t.arrivalMode;
            },
            set value($$value) {
              t.arrivalMode = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Referral Source",
            name: "referralSource",
            options: [
              { value: "self", label: "Self-referral" },
              { value: "gp", label: "GP" },
              { value: "999", label: "999" },
              { value: "nhs111", label: "NHS 111" },
              { value: "other-hospital", label: "Other Hospital" },
              { value: "police", label: "Police" },
              { value: "other", label: "Other" }
            ],
            get value() {
              return t.referralSource;
            },
            set value($$value) {
              t.referralSource = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (t.arrivalMode === "ambulance") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Ambulance Incident Number",
              name: "ambulanceIncidentNumber",
              get value() {
                return t.ambulanceIncidentNumber;
              },
              set value($$value) {
                t.ambulanceIncidentNumber = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Triage</h3> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Triage Time",
            name: "triageTime",
            type: "time",
            get value() {
              return t.triageTime;
            },
            set value($$value) {
              t.triageTime = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Triage Nurse",
            name: "triageNurse",
            get value() {
              return t.triageNurse;
            },
            set value($$value) {
              t.triageNurse = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          SelectInput($$renderer4, {
            label: "MTS Flowchart",
            name: "mtsFlowchart",
            options: [
              { value: "abdominal-pain", label: "Abdominal Pain" },
              { value: "allergy", label: "Allergy" },
              { value: "asthma", label: "Asthma" },
              { value: "back-pain", label: "Back Pain" },
              { value: "breathing-difficulty", label: "Breathing Difficulty" },
              { value: "burns-scalds", label: "Burns & Scalds" },
              { value: "chest-pain", label: "Chest Pain" },
              { value: "collapse", label: "Collapse" },
              { value: "dental-problems", label: "Dental Problems" },
              { value: "diarrhoea-vomiting", label: "Diarrhoea & Vomiting" },
              { value: "ear-problems", label: "Ear Problems" },
              { value: "eye-problems", label: "Eye Problems" },
              { value: "falls", label: "Falls" },
              { value: "head-injury", label: "Head Injury" },
              { value: "headache", label: "Headache" },
              { value: "limb-problems", label: "Limb Problems" },
              { value: "major-trauma", label: "Major Trauma" },
              { value: "mental-health", label: "Mental Health" },
              { value: "neck-pain", label: "Neck Pain" },
              { value: "overdose-poisoning", label: "Overdose & Poisoning" },
              { value: "palpitations", label: "Palpitations" },
              { value: "rashes", label: "Rashes" },
              { value: "self-harm", label: "Self-Harm" },
              { value: "shortness-of-breath", label: "Shortness of Breath" },
              { value: "sore-throat", label: "Sore Throat" },
              { value: "unwell-adult", label: "Unwell Adult" },
              { value: "unwell-child", label: "Unwell Child" },
              { value: "urinary-problems", label: "Urinary Problems" },
              { value: "wound", label: "Wound" },
              { value: "other", label: "Other" }
            ],
            get value() {
              return t.mtsFlowchart;
            },
            set value($$value) {
              t.mtsFlowchart = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "MTS Category",
            name: "mtsCategory",
            options: [
              { value: "1-immediate", label: "1 - Immediate (Red)" },
              { value: "2-very-urgent", label: "2 - Very Urgent (Orange)" },
              { value: "3-urgent", label: "3 - Urgent (Yellow)" },
              { value: "4-standard", label: "4 - Standard (Green)" },
              { value: "5-non-urgent", label: "5 - Non-Urgent (Blue)" }
            ],
            get value() {
              return t.mtsCategory;
            },
            set value($$value) {
              t.mtsCategory = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "MTS Discriminator",
            name: "mtsDiscriminator",
            get value() {
              return t.mtsDiscriminator;
            },
            set value($$value) {
              t.mtsDiscriminator = $$value;
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
function Step4PresentingComplaint($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const pc = casualtyCard.data.presentingComplaint;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Presenting Complaint",
        description: "Chief complaint and history of presenting illness",
        children: ($$renderer4) => {
          TextInput($$renderer4, {
            label: "Chief Complaint",
            name: "chiefComplaint",
            required: true,
            get value() {
              return pc.chiefComplaint;
            },
            set value($$value) {
              pc.chiefComplaint = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "History of Presenting Complaint",
            name: "historyOfPresentingComplaint",
            rows: 4,
            get value() {
              return pc.historyOfPresentingComplaint;
            },
            set value($$value) {
              pc.historyOfPresentingComplaint = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <h3 class="mb-3 mt-4 text-lg font-semibold text-gray-800">Symptom Details</h3> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Onset",
            name: "onset",
            placeholder: "When did it start?",
            get value() {
              return pc.onset;
            },
            set value($$value) {
              pc.onset = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Duration",
            name: "duration",
            get value() {
              return pc.duration;
            },
            set value($$value) {
              pc.duration = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Character",
            name: "character",
            placeholder: "e.g. sharp, dull, burning",
            get value() {
              return pc.character;
            },
            set value($$value) {
              pc.character = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Severity",
            name: "severity",
            get value() {
              return pc.severity;
            },
            set value($$value) {
              pc.severity = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Location",
            name: "location",
            get value() {
              return pc.location;
            },
            set value($$value) {
              pc.location = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Radiation",
            name: "radiation",
            get value() {
              return pc.radiation;
            },
            set value($$value) {
              pc.radiation = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          TextArea($$renderer4, {
            label: "Aggravating Factors",
            name: "aggravatingFactors",
            rows: 2,
            get value() {
              return pc.aggravatingFactors;
            },
            set value($$value) {
              pc.aggravatingFactors = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Relieving Factors",
            name: "relievingFactors",
            rows: 2,
            get value() {
              return pc.relievingFactors;
            },
            set value($$value) {
              pc.relievingFactors = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Associated Symptoms",
            name: "associatedSymptoms",
            rows: 2,
            get value() {
              return pc.associatedSymptoms;
            },
            set value($$value) {
              pc.associatedSymptoms = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Previous Episodes",
            name: "previousEpisodes",
            rows: 2,
            get value() {
              return pc.previousEpisodes;
            },
            set value($$value) {
              pc.previousEpisodes = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Treatment Prior to Arrival",
            name: "treatmentPriorToArrival",
            rows: 2,
            get value() {
              return pc.treatmentPriorToArrival;
            },
            set value($$value) {
              pc.treatmentPriorToArrival = $$value;
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
function Step5PainAssessment($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const p = casualtyCard.data.painAssessment;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Pain Assessment",
        description: "Numeric Rating Scale (NRS) pain evaluation",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Is the patient in pain?",
            name: "painPresent",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return p.painPresent;
            },
            set value($$value) {
              p.painPresent = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (p.painPresent === "yes") {
            $$renderer4.push("<!--[0-->");
            NumberInput($$renderer4, {
              label: "Pain Score",
              name: "painScore",
              min: 0,
              max: 10,
              unit: "0-10 NRS",
              get value() {
                return p.painScore;
              },
              set value($$value) {
                p.painScore = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Pain Location",
              name: "painLocation",
              get value() {
                return p.painLocation;
              },
              set value($$value) {
                p.painLocation = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Pain Character",
              name: "painCharacter",
              placeholder: "e.g. sharp, aching, burning, throbbing",
              get value() {
                return p.painCharacter;
              },
              set value($$value) {
                p.painCharacter = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Pain Onset",
              name: "painOnset",
              placeholder: "e.g. sudden, gradual",
              get value() {
                return p.painOnset;
              },
              set value($$value) {
                p.painOnset = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            RadioGroup($$renderer4, {
              label: "Pain Severity Category",
              name: "painSeverityCategory",
              options: [
                { value: "mild", label: "Mild (1-3)" },
                { value: "moderate", label: "Moderate (4-6)" },
                { value: "severe", label: "Severe (7-10)" }
              ],
              get value() {
                return p.painSeverityCategory;
              },
              set value($$value) {
                p.painSeverityCategory = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!---->`);
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
function Step6MedicalHistory($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const mh = casualtyCard.data.medicalHistory;
    const severityOptions = [
      { value: "mild", label: "Mild" },
      { value: "moderate", label: "Moderate" },
      { value: "anaphylaxis", label: "Anaphylaxis" }
    ];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Medical History",
        description: "Past medical history, medications, allergies, and social history",
        children: ($$renderer4) => {
          TextArea($$renderer4, {
            label: "Past Medical History",
            name: "pastMedicalHistory",
            rows: 3,
            get value() {
              return mh.pastMedicalHistory;
            },
            set value($$value) {
              mh.pastMedicalHistory = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Past Surgical History",
            name: "pastSurgicalHistory",
            rows: 2,
            get value() {
              return mh.pastSurgicalHistory;
            },
            set value($$value) {
              mh.pastSurgicalHistory = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Medications</h3> <div class="space-y-3"><!--[-->`);
          const each_array = ensure_array_like(mh.medications);
          for (let i = 0, $$length = each_array.length; i < $$length; i++) {
            let med = each_array[i];
            $$renderer4.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3"><input type="text" placeholder="Medication name"${attr("value", med.name)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Dose"${attr("value", med.dose)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Frequency"${attr("value", med.frequency)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove medication">×</button></div>`);
          }
          $$renderer4.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Medication</button></div> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Allergies</h3> <div class="space-y-3"><!--[-->`);
          const each_array_1 = ensure_array_like(mh.allergies);
          for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
            let allergy = each_array_1[i];
            $$renderer4.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3"><input type="text" placeholder="Allergen"${attr("value", allergy.allergen)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Reaction"${attr("value", allergy.reaction)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> `);
            $$renderer4.select(
              {
                value: allergy.severity,
                class: "rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
              },
              ($$renderer5) => {
                $$renderer5.option({ value: "" }, ($$renderer6) => {
                  $$renderer6.push(`Severity`);
                });
                $$renderer5.push(`<!--[-->`);
                const each_array_2 = ensure_array_like(severityOptions);
                for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
                  let opt = each_array_2[$$index_1];
                  $$renderer5.option({ value: opt.value }, ($$renderer6) => {
                    $$renderer6.push(`${escape_html(opt.label)}`);
                  });
                }
                $$renderer5.push(`<!--]-->`);
              }
            );
            $$renderer4.push(`</div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove allergy">×</button></div>`);
          }
          $$renderer4.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Allergy</button></div> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Other History</h3> `);
          RadioGroup($$renderer4, {
            label: "Tetanus Status",
            name: "tetanusStatus",
            options: [
              { value: "up-to-date", label: "Up to date" },
              { value: "not-up-to-date", label: "Not up to date" },
              { value: "unknown", label: "Unknown" }
            ],
            get value() {
              return mh.tetanusStatus;
            },
            set value($$value) {
              mh.tetanusStatus = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Smoking Status",
            name: "smokingStatus",
            options: [
              { value: "current", label: "Current smoker" },
              { value: "ex", label: "Ex-smoker" },
              { value: "never", label: "Never smoked" }
            ],
            get value() {
              return mh.smokingStatus;
            },
            set value($$value) {
              mh.smokingStatus = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Alcohol Consumption",
            name: "alcoholConsumption",
            placeholder: "e.g. 10 units/week",
            get value() {
              return mh.alcoholConsumption;
            },
            set value($$value) {
              mh.alcoholConsumption = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Recreational Drug Use",
            name: "recreationalDrugUse",
            get value() {
              return mh.recreationalDrugUse;
            },
            set value($$value) {
              mh.recreationalDrugUse = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Last Oral Intake",
            name: "lastOralIntake",
            placeholder: "Time and type of last food/drink",
            get value() {
              return mh.lastOralIntake;
            },
            set value($$value) {
              mh.lastOralIntake = $$value;
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
function Step7VitalSigns($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const v = casualtyCard.data.vitalSigns;
    const news2 = derived(() => calculateNEWS2(v));
    const hasAnyVitals = derived(() => v.heartRate !== null || v.systolicBP !== null || v.respiratoryRate !== null || v.oxygenSaturation !== null || v.temperature !== null || v.consciousnessLevel !== "");
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Vital Signs",
        description: "Observations and NEWS2 auto-calculation",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          NumberInput($$renderer4, {
            label: "Heart Rate",
            name: "heartRate",
            min: 0,
            max: 300,
            unit: "bpm",
            get value() {
              return v.heartRate;
            },
            set value($$value) {
              v.heartRate = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          NumberInput($$renderer4, {
            label: "Respiratory Rate",
            name: "respiratoryRate",
            min: 0,
            max: 60,
            unit: "/min",
            get value() {
              return v.respiratoryRate;
            },
            set value($$value) {
              v.respiratoryRate = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          NumberInput($$renderer4, {
            label: "Systolic BP",
            name: "systolicBP",
            min: 0,
            max: 300,
            unit: "mmHg",
            get value() {
              return v.systolicBP;
            },
            set value($$value) {
              v.systolicBP = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          NumberInput($$renderer4, {
            label: "Diastolic BP",
            name: "diastolicBP",
            min: 0,
            max: 200,
            unit: "mmHg",
            get value() {
              return v.diastolicBP;
            },
            set value($$value) {
              v.diastolicBP = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          NumberInput($$renderer4, {
            label: "Oxygen Saturation",
            name: "oxygenSaturation",
            min: 0,
            max: 100,
            unit: "%",
            get value() {
              return v.oxygenSaturation;
            },
            set value($$value) {
              v.oxygenSaturation = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          NumberInput($$renderer4, {
            label: "Temperature",
            name: "temperature",
            min: 25,
            max: 45,
            step: 0.1,
            unit: "°C",
            get value() {
              return v.temperature;
            },
            set value($$value) {
              v.temperature = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          RadioGroup($$renderer4, {
            label: "Supplemental Oxygen?",
            name: "supplementalOxygen",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return v.supplementalOxygen;
            },
            set value($$value) {
              v.supplementalOxygen = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (v.supplementalOxygen === "yes") {
            $$renderer4.push("<!--[0-->");
            NumberInput($$renderer4, {
              label: "Oxygen Flow Rate",
              name: "oxygenFlowRate",
              min: 0,
              max: 15,
              unit: "L/min",
              get value() {
                return v.oxygenFlowRate;
              },
              set value($$value) {
                v.oxygenFlowRate = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          SelectInput($$renderer4, {
            label: "Consciousness Level (ACVPU)",
            name: "consciousnessLevel",
            options: [
              { value: "alert", label: "Alert" },
              { value: "verbal", label: "Responds to Voice" },
              { value: "pain", label: "Responds to Pain" },
              { value: "unresponsive", label: "Unresponsive" }
            ],
            get value() {
              return v.consciousnessLevel;
            },
            set value($$value) {
              v.consciousnessLevel = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          NumberInput($$renderer4, {
            label: "Blood Glucose",
            name: "bloodGlucose",
            min: 0,
            max: 40,
            step: 0.1,
            unit: "mmol/L",
            get value() {
              return v.bloodGlucose;
            },
            set value($$value) {
              v.bloodGlucose = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Pupils</h3> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          NumberInput($$renderer4, {
            label: "Left Pupil Size",
            name: "pupilLeftSize",
            min: 1,
            max: 9,
            unit: "mm",
            get value() {
              return v.pupilLeftSize;
            },
            set value($$value) {
              v.pupilLeftSize = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Left Pupil Reactive?",
            name: "pupilLeftReactive",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return v.pupilLeftReactive;
            },
            set value($$value) {
              v.pupilLeftReactive = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          NumberInput($$renderer4, {
            label: "Right Pupil Size",
            name: "pupilRightSize",
            min: 1,
            max: 9,
            unit: "mm",
            get value() {
              return v.pupilRightSize;
            },
            set value($$value) {
              v.pupilRightSize = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Right Pupil Reactive?",
            name: "pupilRightReactive",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return v.pupilRightReactive;
            },
            set value($$value) {
              v.pupilRightReactive = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          NumberInput($$renderer4, {
            label: "Capillary Refill Time",
            name: "capillaryRefillTime",
            min: 0,
            max: 10,
            unit: "seconds",
            get value() {
              return v.capillaryRefillTime;
            },
            set value($$value) {
              v.capillaryRefillTime = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          NumberInput($$renderer4, {
            label: "Weight",
            name: "weight",
            min: 0,
            max: 300,
            step: 0.1,
            unit: "kg",
            get value() {
              return v.weight;
            },
            set value($$value) {
              v.weight = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          if (hasAnyVitals()) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">NEWS2 Score (Auto-calculated)</h3> <div${attr_class(`rounded-lg border-2 p-4 ${stringify(news2ResponseColor(news2().clinicalResponse))}`)}><div class="text-center"><div class="text-3xl font-bold">${escape_html(news2().totalScore)}</div> <div class="mt-1 text-sm font-medium">${escape_html(news2ResponseLabel(news2().clinicalResponse))}</div></div> <div class="mt-3 space-y-1 text-sm"><!--[-->`);
            const each_array = ensure_array_like(news2().parameterScores);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let ps = each_array[$$index];
              $$renderer4.push(`<div class="flex justify-between"><span>${escape_html(ps.parameter)}: ${escape_html(ps.value)}</span> <span class="font-medium">${escape_html(ps.score)}</span></div>`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
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
function Step8PrimarySurvey($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const ps = casualtyCard.data.primarySurvey;
    const gcsTotal = derived(() => (ps.disability.gcsEye ?? 0) + (ps.disability.gcsVerbal ?? 0) + (ps.disability.gcsMotor ?? 0) || null);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Primary Survey (ABCDE)",
        description: "Systematic ABCDE assessment",
        children: ($$renderer4) => {
          $$renderer4.push(`<h3 class="mb-3 text-lg font-semibold text-gray-800">A — Airway</h3> `);
          SelectInput($$renderer4, {
            label: "Airway Status",
            name: "airwayStatus",
            options: [
              { value: "patent", label: "Patent" },
              { value: "compromised", label: "Compromised" },
              { value: "obstructed", label: "Obstructed" }
            ],
            get value() {
              return ps.airway.status;
            },
            set value($$value) {
              ps.airway.status = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Adjuncts Used",
            name: "airwayAdjuncts",
            placeholder: "e.g. OPA, NPA, LMA",
            get value() {
              return ps.airway.adjuncts;
            },
            set value($$value) {
              ps.airway.adjuncts = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "C-Spine Immobilised?",
            name: "cSpineImmobilised",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return ps.airway.cSpineImmobilised;
            },
            set value($$value) {
              ps.airway.cSpineImmobilised = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">B — Breathing</h3> `);
          SelectInput($$renderer4, {
            label: "Breathing Effort",
            name: "breathingEffort",
            options: [
              { value: "normal", label: "Normal" },
              { value: "laboured", label: "Laboured" },
              { value: "shallow", label: "Shallow" },
              { value: "absent", label: "Absent" }
            ],
            get value() {
              return ps.breathing.effort;
            },
            set value($$value) {
              ps.breathing.effort = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Chest Movement",
            name: "chestMovement",
            placeholder: "e.g. bilateral, equal",
            get value() {
              return ps.breathing.chestMovement;
            },
            set value($$value) {
              ps.breathing.chestMovement = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Breath Sounds",
            name: "breathSounds",
            placeholder: "e.g. clear, wheeze, crackles",
            get value() {
              return ps.breathing.breathSounds;
            },
            set value($$value) {
              ps.breathing.breathSounds = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Trachea Position",
            name: "tracheaPosition",
            placeholder: "e.g. central, deviated",
            get value() {
              return ps.breathing.tracheaPosition;
            },
            set value($$value) {
              ps.breathing.tracheaPosition = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">C — Circulation</h3> `);
          TextInput($$renderer4, {
            label: "Pulse Character",
            name: "pulseCharacter",
            placeholder: "e.g. regular, strong",
            get value() {
              return ps.circulation.pulseCharacter;
            },
            set value($$value) {
              ps.circulation.pulseCharacter = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Skin Colour",
            name: "skinColour",
            placeholder: "e.g. normal, pale, cyanosed",
            get value() {
              return ps.circulation.skinColour;
            },
            set value($$value) {
              ps.circulation.skinColour = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Skin Temperature",
            name: "skinTemperature",
            placeholder: "e.g. warm, cool, clammy",
            get value() {
              return ps.circulation.skinTemperature;
            },
            set value($$value) {
              ps.circulation.skinTemperature = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          TextInput($$renderer4, {
            label: "Capillary Refill",
            name: "capillaryRefill",
            placeholder: "e.g. < 2 seconds",
            get value() {
              return ps.circulation.capillaryRefill;
            },
            set value($$value) {
              ps.circulation.capillaryRefill = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Haemorrhage",
            name: "haemorrhage",
            placeholder: "Describe any bleeding",
            rows: 2,
            get value() {
              return ps.circulation.haemorrhage;
            },
            set value($$value) {
              ps.circulation.haemorrhage = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "IV Access",
            name: "ivAccess",
            placeholder: "e.g. 18G left ACF",
            get value() {
              return ps.circulation.ivAccess;
            },
            set value($$value) {
              ps.circulation.ivAccess = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">D — Disability</h3> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">`);
          NumberInput($$renderer4, {
            label: "GCS Eye (1-4)",
            name: "gcsEye",
            min: 1,
            max: 4,
            get value() {
              return ps.disability.gcsEye;
            },
            set value($$value) {
              ps.disability.gcsEye = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          NumberInput($$renderer4, {
            label: "GCS Verbal (1-5)",
            name: "gcsVerbal",
            min: 1,
            max: 5,
            get value() {
              return ps.disability.gcsVerbal;
            },
            set value($$value) {
              ps.disability.gcsVerbal = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          NumberInput($$renderer4, {
            label: "GCS Motor (1-6)",
            name: "gcsMotor",
            min: 1,
            max: 6,
            get value() {
              return ps.disability.gcsMotor;
            },
            set value($$value) {
              ps.disability.gcsMotor = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          if (gcsTotal() !== null) {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<div class="mb-4 rounded-lg bg-gray-50 p-3 text-sm"><span class="font-medium">GCS Total:</span> ${escape_html(gcsTotal())}/15 `);
            if (gcsTotal() <= 8) {
              $$renderer4.push("<!--[0-->");
              $$renderer4.push(`<span class="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Unconscious — consider airway</span>`);
            } else {
              $$renderer4.push("<!--[-1-->");
            }
            $$renderer4.push(`<!--]--></div>`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          TextInput($$renderer4, {
            label: "Pupils",
            name: "disabilityPupils",
            placeholder: "e.g. equal and reactive",
            get value() {
              return ps.disability.pupils;
            },
            set value($$value) {
              ps.disability.pupils = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Blood Glucose",
            name: "disabilityBloodGlucose",
            placeholder: "e.g. 5.5 mmol/L",
            get value() {
              return ps.disability.bloodGlucose;
            },
            set value($$value) {
              ps.disability.bloodGlucose = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Limb Movements",
            name: "limbMovements",
            placeholder: "e.g. all limbs moving",
            get value() {
              return ps.disability.limbMovements;
            },
            set value($$value) {
              ps.disability.limbMovements = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">E — Exposure</h3> `);
          TextArea($$renderer4, {
            label: "Skin Examination",
            name: "skinExamination",
            rows: 2,
            get value() {
              return ps.exposure.skinExamination;
            },
            set value($$value) {
              ps.exposure.skinExamination = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Injuries Identified",
            name: "injuriesIdentified",
            rows: 2,
            get value() {
              return ps.exposure.injuriesIdentified;
            },
            set value($$value) {
              ps.exposure.injuriesIdentified = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Log Roll Findings",
            name: "logRollFindings",
            rows: 2,
            get value() {
              return ps.exposure.logRollFindings;
            },
            set value($$value) {
              ps.exposure.logRollFindings = $$value;
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
function Step9ClinicalExamination($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const ce = casualtyCard.data.clinicalExamination;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Clinical Examination",
        description: "Systematic clinical examination findings",
        children: ($$renderer4) => {
          TextArea($$renderer4, {
            label: "General Appearance",
            name: "generalAppearance",
            placeholder: "e.g. alert, orientated, comfortable at rest",
            get value() {
              return ce.generalAppearance;
            },
            set value($$value) {
              ce.generalAppearance = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Head & Face",
            name: "headAndFace",
            rows: 2,
            get value() {
              return ce.headAndFace;
            },
            set value($$value) {
              ce.headAndFace = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Neck",
            name: "neck",
            rows: 2,
            get value() {
              return ce.neck;
            },
            set value($$value) {
              ce.neck = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Chest — Cardiovascular",
            name: "chestCardiovascular",
            rows: 2,
            get value() {
              return ce.chestCardiovascular;
            },
            set value($$value) {
              ce.chestCardiovascular = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Chest — Respiratory",
            name: "chestRespiratory",
            rows: 2,
            get value() {
              return ce.chestRespiratory;
            },
            set value($$value) {
              ce.chestRespiratory = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Abdomen",
            name: "abdomen",
            rows: 2,
            get value() {
              return ce.abdomen;
            },
            set value($$value) {
              ce.abdomen = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Pelvis",
            name: "pelvis",
            rows: 2,
            get value() {
              return ce.pelvis;
            },
            set value($$value) {
              ce.pelvis = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Musculoskeletal / Limbs",
            name: "musculoskeletalLimbs",
            rows: 2,
            get value() {
              return ce.musculoskeletalLimbs;
            },
            set value($$value) {
              ce.musculoskeletalLimbs = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Neurological",
            name: "neurological",
            rows: 2,
            get value() {
              return ce.neurological;
            },
            set value($$value) {
              ce.neurological = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Skin",
            name: "skin",
            rows: 2,
            get value() {
              return ce.skin;
            },
            set value($$value) {
              ce.skin = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Mental State",
            name: "mentalState",
            rows: 2,
            get value() {
              return ce.mentalState;
            },
            set value($$value) {
              ce.mentalState = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Body Diagram Notes",
            name: "bodyDiagramNotes",
            placeholder: "Document any injury locations or findings",
            rows: 3,
            get value() {
              return ce.bodyDiagramNotes;
            },
            set value($$value) {
              ce.bodyDiagramNotes = $$value;
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
function CheckboxGroup($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { label, options, values = [] } = $$props;
    $$renderer2.push(`<fieldset class="mb-4"><legend class="mb-2 block text-sm font-medium text-gray-700">${escape_html(label)}</legend> <div class="flex flex-wrap gap-3"><!--[-->`);
    const each_array = ensure_array_like(options);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let opt = each_array[$$index];
      $$renderer2.push(`<label${attr_class(`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${stringify(values.includes(opt.value) ? "border-primary bg-blue-50 font-medium" : "border-gray-300 bg-white hover:bg-gray-50")}`)}><input type="checkbox"${attr("checked", values.includes(opt.value), true)} class="accent-primary"/> ${escape_html(opt.label)}</label>`);
    }
    $$renderer2.push(`<!--]--></div></fieldset>`);
    bind_props($$props, { values });
  });
}
function Step10Investigations($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const inv = casualtyCard.data.investigations;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Investigations",
        description: "Blood tests, imaging, ECG, and other investigations",
        children: ($$renderer4) => {
          CheckboxGroup($$renderer4, {
            label: "Blood Tests Requested",
            options: [
              { value: "fbc", label: "FBC" },
              { value: "ue", label: "U&E" },
              { value: "lfts", label: "LFTs" },
              { value: "crp", label: "CRP" },
              { value: "coagulation", label: "Coagulation" },
              { value: "troponin", label: "Troponin" },
              { value: "blood-gas", label: "Blood Gas" },
              { value: "lactate", label: "Lactate" },
              { value: "amylase", label: "Amylase" },
              { value: "blood-cultures", label: "Blood Cultures" },
              { value: "group-save", label: "Group & Save" },
              { value: "crossmatch", label: "Crossmatch" }
            ],
            get values() {
              return inv.bloodTests;
            },
            set values($$value) {
              inv.bloodTests = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> `);
          TextArea($$renderer4, {
            label: "Urinalysis (Dipstick Results)",
            name: "urinalysis",
            rows: 2,
            get value() {
              return inv.urinalysis;
            },
            set value($$value) {
              inv.urinalysis = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Pregnancy Test",
            name: "pregnancyTest",
            placeholder: "e.g. positive, negative, not indicated",
            get value() {
              return inv.pregnancyTest;
            },
            set value($$value) {
              inv.pregnancyTest = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Imaging</h3> <div class="space-y-3"><!--[-->`);
          const each_array = ensure_array_like(inv.imaging);
          for (let i = 0, $$length = each_array.length; i < $$length; i++) {
            let img = each_array[i];
            $$renderer4.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3"><input type="text" placeholder="Type (e.g. X-ray, CT)"${attr("value", img.type)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Site"${attr("value", img.site)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Findings"${attr("value", img.findings)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove imaging">×</button></div>`);
          }
          $$renderer4.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Imaging</button></div> <hr class="my-6 border-gray-200"/> `);
          RadioGroup($$renderer4, {
            label: "ECG Performed?",
            name: "ecgPerformed",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return inv.ecgPerformed;
            },
            set value($$value) {
              inv.ecgPerformed = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (inv.ecgPerformed === "yes") {
            $$renderer4.push("<!--[0-->");
            TextArea($$renderer4, {
              label: "ECG Findings",
              name: "ecgFindings",
              rows: 2,
              get value() {
                return inv.ecgFindings;
              },
              set value($$value) {
                inv.ecgFindings = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          TextArea($$renderer4, {
            label: "Other Investigations",
            name: "otherInvestigations",
            rows: 2,
            get value() {
              return inv.otherInvestigations;
            },
            set value($$value) {
              inv.otherInvestigations = $$value;
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
function Step11Treatment($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const tx = casualtyCard.data.treatment;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Treatment & Interventions",
        description: "Medications administered, fluids, procedures, and other treatments",
        children: ($$renderer4) => {
          $$renderer4.push(`<h3 class="mb-3 text-lg font-semibold text-gray-800">Medications Administered</h3> <div class="space-y-3"><!--[-->`);
          const each_array = ensure_array_like(tx.medicationsAdministered);
          for (let i = 0, $$length = each_array.length; i < $$length; i++) {
            let med = each_array[i];
            $$renderer4.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-5"><input type="text" placeholder="Drug"${attr("value", med.drug)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Dose"${attr("value", med.dose)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Route"${attr("value", med.route)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="time" placeholder="Time"${attr("value", med.time)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Given by"${attr("value", med.givenBy)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove medication">×</button></div>`);
          }
          $$renderer4.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Medication</button></div> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Fluid Therapy</h3> <div class="space-y-3"><!--[-->`);
          const each_array_1 = ensure_array_like(tx.fluidTherapy);
          for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
            let fluid = each_array_1[i];
            $$renderer4.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4"><input type="text" placeholder="Type (e.g. NaCl 0.9%)"${attr("value", fluid.type)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Volume"${attr("value", fluid.volume)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Rate"${attr("value", fluid.rate)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="time" placeholder="Time Started"${attr("value", fluid.timeStarted)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove fluid">×</button></div>`);
          }
          $$renderer4.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Fluid</button></div> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Procedures</h3> <div class="space-y-3"><!--[-->`);
          const each_array_2 = ensure_array_like(tx.procedures);
          for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
            let proc = each_array_2[i];
            $$renderer4.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2"><input type="text" placeholder="Description"${attr("value", proc.description)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="time" placeholder="Time"${attr("value", proc.time)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove procedure">×</button></div>`);
          }
          $$renderer4.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Procedure</button></div> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Oxygen Therapy</h3> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Device",
            name: "oxygenTherapyDevice",
            placeholder: "e.g. nasal cannula, face mask",
            get value() {
              return tx.oxygenTherapyDevice;
            },
            set value($$value) {
              tx.oxygenTherapyDevice = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Flow Rate",
            name: "oxygenTherapyFlowRate",
            placeholder: "e.g. 2 L/min",
            get value() {
              return tx.oxygenTherapyFlowRate;
            },
            set value($$value) {
              tx.oxygenTherapyFlowRate = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          RadioGroup($$renderer4, {
            label: "Tetanus Prophylaxis",
            name: "tetanusProphylaxis",
            options: [
              { value: "given", label: "Given" },
              { value: "not-indicated", label: "Not Indicated" },
              { value: "status-checked", label: "Status Checked" }
            ],
            get value() {
              return tx.tetanusProphylaxis;
            },
            set value($$value) {
              tx.tetanusProphylaxis = $$value;
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
function Step12AssessmentPlan($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const ap = casualtyCard.data.assessmentPlan;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Assessment & Plan",
        description: "Working diagnosis and clinical plan",
        children: ($$renderer4) => {
          TextInput($$renderer4, {
            label: "Working Diagnosis",
            name: "workingDiagnosis",
            required: true,
            get value() {
              return ap.workingDiagnosis;
            },
            set value($$value) {
              ap.workingDiagnosis = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Differential Diagnoses",
            name: "differentialDiagnoses",
            rows: 3,
            get value() {
              return ap.differentialDiagnoses;
            },
            set value($$value) {
              ap.differentialDiagnoses = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Clinical Impression",
            name: "clinicalImpression",
            rows: 3,
            get value() {
              return ap.clinicalImpression;
            },
            set value($$value) {
              ap.clinicalImpression = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Risk Stratification",
            name: "riskStratification",
            rows: 2,
            placeholder: "e.g. HEART score, Wells score, CURB-65",
            get value() {
              return ap.riskStratification;
            },
            set value($$value) {
              ap.riskStratification = $$value;
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
function Step13Disposition($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const d = casualtyCard.data.disposition;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Disposition",
        description: "Patient outcome and discharge details",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Disposition",
            name: "disposition",
            options: [
              { value: "admitted", label: "Admitted" },
              { value: "discharged", label: "Discharged" },
              { value: "transferred", label: "Transferred" },
              { value: "left-before-seen", label: "Left Before Seen" },
              { value: "self-discharged", label: "Self-Discharged" }
            ],
            get value() {
              return d.disposition;
            },
            set value($$value) {
              d.disposition = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (d.disposition === "admitted") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<h3 class="mb-3 mt-4 text-lg font-semibold text-gray-800">Admission Details</h3> `);
            TextInput($$renderer4, {
              label: "Admitting Specialty",
              name: "admittingSpecialty",
              get value() {
                return d.admittingSpecialty;
              },
              set value($$value) {
                d.admittingSpecialty = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Admitting Consultant",
              name: "admittingConsultant",
              get value() {
                return d.admittingConsultant;
              },
              set value($$value) {
                d.admittingConsultant = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Ward",
              name: "ward",
              get value() {
                return d.ward;
              },
              set value($$value) {
                d.ward = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Level of Care",
              name: "levelOfCare",
              placeholder: "e.g. Level 1, Level 2, Level 3",
              get value() {
                return d.levelOfCare;
              },
              set value($$value) {
                d.levelOfCare = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (d.disposition === "discharged") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<h3 class="mb-3 mt-4 text-lg font-semibold text-gray-800">Discharge Details</h3> `);
            TextInput($$renderer4, {
              label: "Discharge Diagnosis",
              name: "dischargeDiagnosis",
              get value() {
                return d.dischargeDiagnosis;
              },
              set value($$value) {
                d.dischargeDiagnosis = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextArea($$renderer4, {
              label: "Discharge Medications",
              name: "dischargeMedications",
              rows: 2,
              get value() {
                return d.dischargeMedications;
              },
              set value($$value) {
                d.dischargeMedications = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextArea($$renderer4, {
              label: "Discharge Instructions",
              name: "dischargeInstructions",
              rows: 3,
              get value() {
                return d.dischargeInstructions;
              },
              set value($$value) {
                d.dischargeInstructions = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Follow-up",
              name: "followUp",
              placeholder: "e.g. GP in 48 hours, fracture clinic 1 week",
              get value() {
                return d.followUp;
              },
              set value($$value) {
                d.followUp = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextArea($$renderer4, {
              label: "Return Precautions",
              name: "returnPrecautions",
              rows: 2,
              placeholder: "Safety-net advice for patient",
              get value() {
                return d.returnPrecautions;
              },
              set value($$value) {
                d.returnPrecautions = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          if (d.disposition === "transferred") {
            $$renderer4.push("<!--[0-->");
            $$renderer4.push(`<h3 class="mb-3 mt-4 text-lg font-semibold text-gray-800">Transfer Details</h3> `);
            TextInput($$renderer4, {
              label: "Receiving Hospital",
              name: "receivingHospital",
              get value() {
                return d.receivingHospital;
              },
              set value($$value) {
                d.receivingHospital = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Reason for Transfer",
              name: "reasonForTransfer",
              get value() {
                return d.reasonForTransfer;
              },
              set value($$value) {
                d.reasonForTransfer = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            TextInput($$renderer4, {
              label: "Mode of Transfer",
              name: "modeOfTransfer",
              placeholder: "e.g. ambulance, helicopter",
              get value() {
                return d.modeOfTransfer;
              },
              set value($$value) {
                d.modeOfTransfer = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <hr class="my-6 border-gray-200"/> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Discharge/Transfer Time",
            name: "dischargeTime",
            type: "time",
            get value() {
              return d.dischargeTime;
            },
            set value($$value) {
              d.dischargeTime = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Total Time in Department",
            name: "totalTimeInDepartment",
            placeholder: "e.g. 4h 30m",
            get value() {
              return d.totalTimeInDepartment;
            },
            set value($$value) {
              d.totalTimeInDepartment = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div>`);
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
function Step14SafeguardingConsent($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const sc = casualtyCard.data.safeguardingConsent;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Safeguarding & Consent",
        description: "Safeguarding concerns, mental capacity, and completion details",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Safeguarding Concern?",
            name: "safeguardingConcern",
            options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
            get value() {
              return sc.safeguardingConcern;
            },
            set value($$value) {
              sc.safeguardingConcern = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (sc.safeguardingConcern === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Safeguarding Type",
              name: "safeguardingType",
              placeholder: "e.g. adult, child, domestic violence",
              get value() {
                return sc.safeguardingType;
              },
              set value($$value) {
                sc.safeguardingType = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            RadioGroup($$renderer4, {
              label: "Referral Made?",
              name: "referralMade",
              options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
              get value() {
                return sc.referralMade;
              },
              set value($$value) {
                sc.referralMade = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!---->`);
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> <hr class="my-6 border-gray-200"/> `);
          TextArea($$renderer4, {
            label: "Mental Capacity Assessment",
            name: "mentalCapacityAssessment",
            rows: 2,
            placeholder: "Assessment of capacity to make decisions",
            get value() {
              return sc.mentalCapacityAssessment;
            },
            set value($$value) {
              sc.mentalCapacityAssessment = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Mental Health Act Status",
            name: "mentalHealthActStatus",
            placeholder: "e.g. Section 136, Section 2, informal",
            get value() {
              return sc.mentalHealthActStatus;
            },
            set value($$value) {
              sc.mentalHealthActStatus = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Consent for Treatment",
            name: "consentForTreatment",
            options: [
              { value: "verbal", label: "Verbal" },
              { value: "written", label: "Written" },
              { value: "lacks-capacity", label: "Lacks Capacity" }
            ],
            get value() {
              return sc.consentForTreatment;
            },
            set value($$value) {
              sc.consentForTreatment = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <hr class="my-6 border-gray-200"/> <h3 class="mb-3 text-lg font-semibold text-gray-800">Completed By</h3> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Name",
            name: "completedByName",
            required: true,
            get value() {
              return sc.completedByName;
            },
            set value($$value) {
              sc.completedByName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Role",
            name: "completedByRole",
            get value() {
              return sc.completedByRole;
            },
            set value($$value) {
              sc.completedByRole = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> `);
          TextInput($$renderer4, {
            label: "GMC Number",
            name: "completedByGmcNumber",
            get value() {
              return sc.completedByGmcNumber;
            },
            set value($$value) {
              sc.completedByGmcNumber = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Senior Reviewing Clinician",
            name: "seniorReviewingClinician",
            get value() {
              return sc.seniorReviewingClinician;
            },
            set value($$value) {
              sc.seniorReviewingClinician = $$value;
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
    const isLast = derived(() => stepNumber() === steps[steps.length - 1].number);
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
        Step2NextOfKinGP($$renderer2);
      } else if (stepNumber() === 3) {
        $$renderer2.push("<!--[2-->");
        Step3ArrivalTriage($$renderer2);
      } else if (stepNumber() === 4) {
        $$renderer2.push("<!--[3-->");
        Step4PresentingComplaint($$renderer2);
      } else if (stepNumber() === 5) {
        $$renderer2.push("<!--[4-->");
        Step5PainAssessment($$renderer2);
      } else if (stepNumber() === 6) {
        $$renderer2.push("<!--[5-->");
        Step6MedicalHistory($$renderer2);
      } else if (stepNumber() === 7) {
        $$renderer2.push("<!--[6-->");
        Step7VitalSigns($$renderer2);
      } else if (stepNumber() === 8) {
        $$renderer2.push("<!--[7-->");
        Step8PrimarySurvey($$renderer2);
      } else if (stepNumber() === 9) {
        $$renderer2.push("<!--[8-->");
        Step9ClinicalExamination($$renderer2);
      } else if (stepNumber() === 10) {
        $$renderer2.push("<!--[9-->");
        Step10Investigations($$renderer2);
      } else if (stepNumber() === 11) {
        $$renderer2.push("<!--[10-->");
        Step11Treatment($$renderer2);
      } else if (stepNumber() === 12) {
        $$renderer2.push("<!--[11-->");
        Step12AssessmentPlan($$renderer2);
      } else if (stepNumber() === 13) {
        $$renderer2.push("<!--[12-->");
        Step13Disposition($$renderer2);
      } else if (stepNumber() === 14) {
        $$renderer2.push("<!--[13-->");
        Step14SafeguardingConsent($$renderer2);
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
