import "clsx";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { a as assessment } from "../../../chunks/assessment.svelte.js";
import { e as escape_html, a as attr, b as bind_props, c as ensure_array_like, d as attr_class, s as stringify } from "../../../chunks/renderer.js";
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
function Step1PersonalInformation($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const p = assessment.data.personalInformation;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Personal Information",
        description: "Please provide your basic personal details",
        children: ($$renderer4) => {
          TextInput($$renderer4, {
            label: "Full Name",
            name: "fullName",
            required: true,
            get value() {
              return p.fullName;
            },
            set value($$value) {
              p.fullName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Date of Birth",
            name: "dob",
            type: "date",
            required: true,
            get value() {
              return p.dateOfBirth;
            },
            set value($$value) {
              p.dateOfBirth = $$value;
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
              return p.sex;
            },
            set value($$value) {
              p.sex = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Address Line 1",
            name: "addr1",
            required: true,
            get value() {
              return p.addressLine1;
            },
            set value($$value) {
              p.addressLine1 = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Address Line 2",
            name: "addr2",
            get value() {
              return p.addressLine2;
            },
            set value($$value) {
              p.addressLine2 = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "City",
            name: "city",
            required: true,
            get value() {
              return p.city;
            },
            set value($$value) {
              p.city = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Postcode",
            name: "postcode",
            required: true,
            get value() {
              return p.postcode;
            },
            set value($$value) {
              p.postcode = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Phone Number",
            name: "phone",
            required: true,
            get value() {
              return p.phone;
            },
            set value($$value) {
              p.phone = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Email",
            name: "email",
            type: "email",
            get value() {
              return p.email;
            },
            set value($$value) {
              p.email = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div> <div class="mt-4 border-t border-gray-200 pt-4"><h3 class="mb-3 text-sm font-semibold text-gray-700">Emergency Contact</h3> `);
          TextInput($$renderer4, {
            label: "Contact Name",
            name: "emergName",
            required: true,
            get value() {
              return p.emergencyContactName;
            },
            set value($$value) {
              p.emergencyContactName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">`);
          TextInput($$renderer4, {
            label: "Contact Phone",
            name: "emergPhone",
            required: true,
            get value() {
              return p.emergencyContactPhone;
            },
            set value($$value) {
              p.emergencyContactPhone = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Relationship",
            name: "emergRelation",
            get value() {
              return p.emergencyContactRelationship;
            },
            set value($$value) {
              p.emergencyContactRelationship = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----></div></div>`);
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
function Step2InsuranceAndId($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const ins = assessment.data.insuranceAndId;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Insurance & ID",
        description: "Insurance and identification details",
        children: ($$renderer4) => {
          TextInput($$renderer4, {
            label: "Insurance Provider",
            name: "insuranceProvider",
            get value() {
              return ins.insuranceProvider;
            },
            set value($$value) {
              ins.insuranceProvider = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Policy Number",
            name: "policyNumber",
            get value() {
              return ins.policyNumber;
            },
            set value($$value) {
              ins.policyNumber = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "NHS Number",
            name: "nhsNumber",
            placeholder: "e.g. 943 476 5919",
            get value() {
              return ins.nhsNumber;
            },
            set value($$value) {
              ins.nhsNumber = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="mt-4 border-t border-gray-200 pt-4"><h3 class="mb-3 text-sm font-semibold text-gray-700">GP Details</h3> `);
          TextInput($$renderer4, {
            label: "GP Name",
            name: "gpName",
            get value() {
              return ins.gpName;
            },
            set value($$value) {
              ins.gpName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "GP Practice Name",
            name: "gpPractice",
            get value() {
              return ins.gpPracticeName;
            },
            set value($$value) {
              ins.gpPracticeName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "GP Phone",
            name: "gpPhone",
            get value() {
              return ins.gpPhone;
            },
            set value($$value) {
              ins.gpPhone = $$value;
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
function Step3ReasonForVisit($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const r = assessment.data.reasonForVisit;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Reason for Visit",
        description: "Please describe why you are visiting today",
        children: ($$renderer4) => {
          TextArea($$renderer4, {
            label: "Primary Reason for Visit",
            name: "primaryReason",
            placeholder: "Please describe your main reason for visiting",
            required: true,
            get value() {
              return r.primaryReason;
            },
            set value($$value) {
              r.primaryReason = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Urgency Level",
            name: "urgency",
            options: [
              { value: "routine", label: "Routine" },
              { value: "urgent", label: "Urgent" },
              { value: "emergency", label: "Emergency" }
            ],
            required: true,
            get value() {
              return r.urgencyLevel;
            },
            set value($$value) {
              r.urgencyLevel = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "Referring Provider",
            name: "referrer",
            placeholder: "If referred by another doctor",
            get value() {
              return r.referringProvider;
            },
            set value($$value) {
              r.referringProvider = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextInput($$renderer4, {
            label: "How long have you had these symptoms?",
            name: "symptomDuration",
            placeholder: "e.g. 2 weeks, 3 months",
            get value() {
              return r.symptomDuration;
            },
            set value($$value) {
              r.symptomDuration = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Additional Details",
            name: "additionalDetails",
            placeholder: "Any other information you'd like to share",
            get value() {
              return r.additionalDetails;
            },
            set value($$value) {
              r.additionalDetails = $$value;
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
function Step4MedicalHistory($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const h = assessment.data.medicalHistory;
    const chronicConditionOptions = [
      { value: "hypertension", label: "Hypertension" },
      { value: "type-1-diabetes", label: "Type 1 Diabetes" },
      { value: "type-2-diabetes", label: "Type 2 Diabetes" },
      { value: "heart-disease", label: "Heart Disease" },
      { value: "heart-failure", label: "Heart Failure" },
      { value: "asthma", label: "Asthma" },
      { value: "copd", label: "COPD" },
      {
        value: "chronic-kidney-disease",
        label: "Chronic Kidney Disease"
      },
      { value: "liver-disease", label: "Liver Disease" },
      { value: "thyroid-disorder", label: "Thyroid Disorder" },
      { value: "epilepsy", label: "Epilepsy" },
      { value: "arthritis", label: "Arthritis" },
      { value: "cancer", label: "Cancer" },
      { value: "depression", label: "Depression" },
      { value: "anxiety", label: "Anxiety" },
      { value: "autoimmune-disorder", label: "Autoimmune Disorder" },
      { value: "other", label: "Other" }
    ];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Medical History",
        description: "Your past and current medical conditions",
        children: ($$renderer4) => {
          CheckboxGroup($$renderer4, {
            label: "Do you have any of the following chronic conditions?",
            options: chronicConditionOptions,
            get values() {
              return h.chronicConditions;
            },
            set values($$value) {
              h.chronicConditions = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Previous Surgeries",
            name: "surgeries",
            placeholder: "List any previous surgeries with approximate dates",
            get value() {
              return h.previousSurgeries;
            },
            set value($$value) {
              h.previousSurgeries = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Previous Hospitalizations",
            name: "hospitalizations",
            placeholder: "List any previous hospital stays with approximate dates and reasons",
            get value() {
              return h.previousHospitalizations;
            },
            set value($$value) {
              h.previousHospitalizations = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Ongoing Treatments",
            name: "treatments",
            placeholder: "Describe any ongoing treatments or therapies",
            get value() {
              return h.ongoingTreatments;
            },
            set value($$value) {
              h.ongoingTreatments = $$value;
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
      $$renderer2.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4"><input type="text" placeholder="Medication name"${attr("value", med.name)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Dose"${attr("value", med.dose)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Frequency"${attr("value", med.frequency)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> <input type="text" placeholder="Prescriber"${attr("value", med.prescriber)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/></div> <button type="button" class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove medication">×</button></div>`);
    }
    $$renderer2.push(`<!--]--> <button type="button" class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">+ Add Medication</button></div>`);
    bind_props($$props, { medications });
  });
}
function Step5Medications($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Current Medications",
        description: "List all medications you currently take, including over-the-counter and supplements",
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
    const typeOptions = [
      { value: "drug", label: "Drug" },
      { value: "food", label: "Food" },
      { value: "environmental", label: "Environmental" },
      { value: "latex", label: "Latex" },
      { value: "other", label: "Other" }
    ];
    $$renderer2.push(`<div class="space-y-3"><!--[-->`);
    const each_array = ensure_array_like(allergies);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let allergy = each_array[i];
      $$renderer2.push(`<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"><div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4"><input type="text" placeholder="Allergen"${attr("value", allergy.allergen)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> `);
      $$renderer2.select(
        {
          value: allergy.allergyType,
          class: "rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Type`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(typeOptions);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let opt = each_array_1[$$index];
            $$renderer3.option({ value: opt.value }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(opt.label)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(` <input type="text" placeholder="Reaction"${attr("value", allergy.reaction)} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"/> `);
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
          const each_array_2 = ensure_array_like(severityOptions);
          for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
            let opt = each_array_2[$$index_1];
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
function Step6Allergies($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Allergies",
        description: "List any known allergies (drug, food, environmental, latex, etc.)",
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
function Step7FamilyHistory($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const f = assessment.data.familyHistory;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Family History",
        description: "Medical conditions in your immediate family (parents, siblings, children)",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Heart disease in family?",
            name: "fhHeart",
            options: yesNo,
            get value() {
              return f.heartDisease;
            },
            set value($$value) {
              f.heartDisease = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (f.heartDisease === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "fhHeartDetails",
              get value() {
                return f.heartDiseaseDetails;
              },
              set value($$value) {
                f.heartDiseaseDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Cancer in family?",
            name: "fhCancer",
            options: yesNo,
            get value() {
              return f.cancer;
            },
            set value($$value) {
              f.cancer = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (f.cancer === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details (type, relation)",
              name: "fhCancerDetails",
              get value() {
                return f.cancerDetails;
              },
              set value($$value) {
                f.cancerDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Diabetes in family?",
            name: "fhDiabetes",
            options: yesNo,
            get value() {
              return f.diabetes;
            },
            set value($$value) {
              f.diabetes = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (f.diabetes === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "fhDiabetesDetails",
              get value() {
                return f.diabetesDetails;
              },
              set value($$value) {
                f.diabetesDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Stroke in family?",
            name: "fhStroke",
            options: yesNo,
            get value() {
              return f.stroke;
            },
            set value($$value) {
              f.stroke = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (f.stroke === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "fhStrokeDetails",
              get value() {
                return f.strokeDetails;
              },
              set value($$value) {
                f.strokeDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Mental illness in family?",
            name: "fhMental",
            options: yesNo,
            get value() {
              return f.mentalIllness;
            },
            set value($$value) {
              f.mentalIllness = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (f.mentalIllness === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "fhMentalDetails",
              get value() {
                return f.mentalIllnessDetails;
              },
              set value($$value) {
                f.mentalIllnessDetails = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
          RadioGroup($$renderer4, {
            label: "Genetic conditions in family?",
            name: "fhGenetic",
            options: yesNo,
            get value() {
              return f.geneticConditions;
            },
            set value($$value) {
              f.geneticConditions = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (f.geneticConditions === "yes") {
            $$renderer4.push("<!--[0-->");
            TextInput($$renderer4, {
              label: "Please provide details",
              name: "fhGeneticDetails",
              get value() {
                return f.geneticConditionsDetails;
              },
              set value($$value) {
                f.geneticConditionsDetails = $$value;
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
function Step8SocialHistory($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const s = assessment.data.socialHistory;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Social History",
        description: "Lifestyle factors relevant to your health",
        children: ($$renderer4) => {
          SelectInput($$renderer4, {
            label: "Smoking status",
            name: "smoking",
            options: [
              { value: "current", label: "Current smoker" },
              { value: "ex", label: "Ex-smoker" },
              { value: "never", label: "Never smoked" }
            ],
            get value() {
              return s.smokingStatus;
            },
            set value($$value) {
              s.smokingStatus = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (s.smokingStatus === "current" || s.smokingStatus === "ex") {
            $$renderer4.push("<!--[0-->");
            NumberInput($$renderer4, {
              label: "Pack years",
              name: "packYears",
              min: 0,
              max: 200,
              get value() {
                return s.smokingPackYears;
              },
              set value($$value) {
                s.smokingPackYears = $$value;
                $$settled = false;
              }
            });
          } else {
            $$renderer4.push("<!--[-1-->");
          }
          $$renderer4.push(`<!--]--> `);
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
              return s.alcoholFrequency;
            },
            set value($$value) {
              s.alcoholFrequency = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (s.alcoholFrequency && s.alcoholFrequency !== "none") {
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
          SelectInput($$renderer4, {
            label: "Recreational drug use",
            name: "drugUse",
            options: [
              { value: "none", label: "None" },
              { value: "occasional", label: "Occasional" },
              { value: "regular", label: "Regular" }
            ],
            get value() {
              return s.drugUse;
            },
            set value($$value) {
              s.drugUse = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (s.drugUse !== "" && s.drugUse !== "none") {
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
          $$renderer4.push(`<!--]--> `);
          TextInput($$renderer4, {
            label: "Occupation",
            name: "occupation",
            get value() {
              return s.occupation;
            },
            set value($$value) {
              s.occupation = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Exercise frequency",
            name: "exercise",
            options: [
              { value: "none", label: "None" },
              { value: "occasional", label: "Occasional (1-2 times/week)" },
              { value: "moderate", label: "Moderate (3-4 times/week)" },
              { value: "regular", label: "Regular (5+ times/week)" }
            ],
            get value() {
              return s.exerciseFrequency;
            },
            set value($$value) {
              s.exerciseFrequency = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Diet quality",
            name: "diet",
            options: [
              { value: "poor", label: "Poor" },
              { value: "average", label: "Average" },
              { value: "good", label: "Good" },
              { value: "excellent", label: "Excellent" }
            ],
            get value() {
              return s.dietQuality;
            },
            set value($$value) {
              s.dietQuality = $$value;
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
function Step9ReviewOfSystems($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const ros = assessment.data.reviewOfSystems;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Review of Systems",
        description: "Please note any current symptoms in each area. Leave blank if none.",
        children: ($$renderer4) => {
          TextArea($$renderer4, {
            label: "Constitutional (fever, weight changes, fatigue)",
            name: "constitutional",
            placeholder: "e.g. unexplained weight loss, persistent fatigue",
            get value() {
              return ros.constitutional;
            },
            set value($$value) {
              ros.constitutional = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "HEENT (Head, Eyes, Ears, Nose, Throat)",
            name: "heent",
            placeholder: "e.g. headaches, vision changes, hearing loss",
            get value() {
              return ros.heent;
            },
            set value($$value) {
              ros.heent = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Cardiovascular",
            name: "cardiovascular",
            placeholder: "e.g. chest pain, palpitations, shortness of breath on exertion",
            get value() {
              return ros.cardiovascular;
            },
            set value($$value) {
              ros.cardiovascular = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Respiratory",
            name: "respiratory",
            placeholder: "e.g. cough, wheezing, shortness of breath",
            get value() {
              return ros.respiratory;
            },
            set value($$value) {
              ros.respiratory = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Gastrointestinal",
            name: "gastrointestinal",
            placeholder: "e.g. nausea, abdominal pain, changes in bowel habits",
            get value() {
              return ros.gastrointestinal;
            },
            set value($$value) {
              ros.gastrointestinal = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Genitourinary",
            name: "genitourinary",
            placeholder: "e.g. urinary frequency, pain, blood in urine",
            get value() {
              return ros.genitourinary;
            },
            set value($$value) {
              ros.genitourinary = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Musculoskeletal",
            name: "musculoskeletal",
            placeholder: "e.g. joint pain, stiffness, swelling",
            get value() {
              return ros.musculoskeletal;
            },
            set value($$value) {
              ros.musculoskeletal = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Neurological",
            name: "neurological",
            placeholder: "e.g. numbness, tingling, weakness, seizures",
            get value() {
              return ros.neurological;
            },
            set value($$value) {
              ros.neurological = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Psychiatric",
            name: "psychiatric",
            placeholder: "e.g. anxiety, depression, sleep disturbance",
            get value() {
              return ros.psychiatric;
            },
            set value($$value) {
              ros.psychiatric = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          TextArea($$renderer4, {
            label: "Skin",
            name: "skin",
            placeholder: "e.g. rashes, lesions, changes in moles",
            get value() {
              return ros.skin;
            },
            set value($$value) {
              ros.skin = $$value;
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
function Step10ConsentAndPreferences($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const c = assessment.data.consentAndPreferences;
    const yesNo = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      SectionCard($$renderer3, {
        title: "Consent & Preferences",
        description: "Please review and confirm your preferences",
        children: ($$renderer4) => {
          RadioGroup($$renderer4, {
            label: "Do you consent to treatment?",
            name: "consentTreatment",
            options: yesNo,
            required: true,
            get value() {
              return c.consentToTreatment;
            },
            set value($$value) {
              c.consentToTreatment = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Do you acknowledge our privacy notice and agree to the use of your data for clinical purposes?",
            name: "privacyAck",
            options: yesNo,
            required: true,
            get value() {
              return c.privacyAcknowledgement;
            },
            set value($$value) {
              c.privacyAcknowledgement = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          SelectInput($$renderer4, {
            label: "Preferred communication method",
            name: "commPref",
            options: [
              { value: "phone", label: "Phone" },
              { value: "email", label: "Email" },
              { value: "text", label: "Text/SMS" },
              { value: "post", label: "Post" }
            ],
            get value() {
              return c.communicationPreference;
            },
            set value($$value) {
              c.communicationPreference = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          RadioGroup($$renderer4, {
            label: "Do you have any advance directives (living will, power of attorney for healthcare)?",
            name: "advanceDirectives",
            options: yesNo,
            get value() {
              return c.advanceDirectives;
            },
            set value($$value) {
              c.advanceDirectives = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          if (c.advanceDirectives === "yes") {
            $$renderer4.push("<!--[0-->");
            TextArea($$renderer4, {
              label: "Please provide details",
              name: "directiveDetails",
              get value() {
                return c.advanceDirectiveDetails;
              },
              set value($$value) {
                c.advanceDirectiveDetails = $$value;
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
    Step1PersonalInformation($$renderer2);
    $$renderer2.push(`<!----> `);
    Step2InsuranceAndId($$renderer2);
    $$renderer2.push(`<!----> `);
    Step3ReasonForVisit($$renderer2);
    $$renderer2.push(`<!----> `);
    Step4MedicalHistory($$renderer2);
    $$renderer2.push(`<!----> `);
    Step5Medications($$renderer2);
    $$renderer2.push(`<!----> `);
    Step6Allergies($$renderer2);
    $$renderer2.push(`<!----> `);
    Step7FamilyHistory($$renderer2);
    $$renderer2.push(`<!----> `);
    Step8SocialHistory($$renderer2);
    $$renderer2.push(`<!----> `);
    Step9ReviewOfSystems($$renderer2);
    $$renderer2.push(`<!----> `);
    Step10ConsentAndPreferences($$renderer2);
    $$renderer2.push(`<!----> <div class="mt-8 flex justify-end"><button type="button" class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark">Submit</button></div>`);
  });
}
export {
  _page as default
};
