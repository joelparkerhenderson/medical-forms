import { a1 as attr, a2 as attr_class, a3 as clsx, e as escape_html, a0 as derived, a4 as stringify, a5 as ensure_array_like } from "../../chunks/index.js";
import "clsx";
import { setEnv } from "@svar-ui/lib-dom";
import "@svar-ui/core-locales";
import { env } from "@svar-ui/lib-svelte";
import "@svar-ui/grid-locales";
import "@svar-ui/lib-state";
import "@svar-ui/grid-store";
function Button($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      type = "",
      css = "",
      icon = "",
      disabled = false,
      title = "",
      text = "",
      children,
      onclick
    } = $$props;
    let buttonCss = derived(() => {
      let cssType = type ? type.split(" ").filter((a) => a !== "").map((x) => "wx-" + x).join(" ") : "";
      return css + (css ? " " : "") + cssType;
    });
    $$renderer2.push(`<button${attr("title", title)}${attr_class(`wx-button ${buttonCss()}`, "svelte-1gdo8eb", { "wx-icon": icon && !children })}${attr("disabled", disabled, true)}>`);
    if (icon) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<i${attr_class(clsx(icon), "svelte-1gdo8eb")}></i>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (children) {
      $$renderer2.push("<!--[0-->");
      children($$renderer2);
      $$renderer2.push(`<!---->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`${escape_html(text)}`);
    }
    $$renderer2.push(`<!--]--></button>`);
  });
}
setEnv(env);
const handlers = {};
function registerToolbarItem(type, handler) {
  handlers[type] = handler;
}
function Separator($$renderer, $$props) {
  let { menu = false } = $$props;
  $$renderer.push(`<div${attr_class(`wx-separator${stringify(menu ? "-menu" : "")}`, "svelte-1r0dt0v")}> </div>`);
}
function Spacer($$renderer) {
  $$renderer.push(`<div class="wx-spacer svelte-i5gjts"></div>`);
}
function Button_1($$renderer, $$props) {
  let { icon, text = "", css, type, disabled, menu, onclick } = $$props;
  if (menu) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<div class="wx-item svelte-1s3wiw0"><i${attr_class(`${stringify(icon || "wxi-empty")} ${stringify(css || "")}`, "svelte-1s3wiw0")}></i> ${escape_html(text)}</div>`);
  } else {
    $$renderer.push("<!--[-1-->");
    Button($$renderer, { icon, type, css, text, disabled, onclick });
  }
  $$renderer.push(`<!--]-->`);
}
function Label($$renderer, $$props) {
  const { text, value, children } = $$props;
  if (children) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<div class="wx-label svelte-hf53ue">`);
    children($$renderer);
    $$renderer.push(`<!----></div>`);
  } else {
    $$renderer.push("<!--[-1-->");
    $$renderer.push(`<div class="wx-label svelte-hf53ue">${escape_html(value || text)}</div>`);
  }
  $$renderer.push(`<!--]-->`);
}
function Icon($$renderer, $$props) {
  let { icon, text, css, type, disabled, menu, onclick } = $$props;
  if (menu) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<div class="wx-item svelte-1ajar0v">`);
    if (icon) {
      $$renderer.push("<!--[0-->");
      $$renderer.push(`<i${attr_class(`${stringify(icon)} ${stringify(css)}`, "svelte-1ajar0v")}></i>`);
    } else {
      $$renderer.push("<!--[-1-->");
    }
    $$renderer.push(`<!--]--> ${escape_html(text)}</div>`);
  } else {
    $$renderer.push("<!--[-1-->");
    Button($$renderer, { icon, type, css, title: text, disabled, onclick });
  }
  $$renderer.push(`<!--]-->`);
}
function Item($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { id = "", text = "", css = "", icon = "", onclick } = $$props;
    $$renderer2.push(`<div${attr_class(`wx-label ${stringify(css)}`, "svelte-v98dh1")}>`);
    if (icon) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<i${attr_class(clsx(icon), "svelte-v98dh1")}></i>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> ${escape_html(text)}</div>`);
  });
}
registerToolbarItem("button", Button_1);
registerToolbarItem("separator", Separator);
registerToolbarItem("spacer", Spacer);
registerToolbarItem("label", Label);
registerToolbarItem("item", Item);
registerToolbarItem("icon", Icon);
setEnv(env);
const patients = [
  {
    id: "1",
    nhsNumber: "943 476 5919",
    patientName: "Smith, John",
    mmseScore: 28,
    cognitiveLevel: "Normal cognition",
    ageGroup: "65-74",
    referralSource: "GP"
  },
  {
    id: "2",
    nhsNumber: "721 938 4102",
    patientName: "Patel, Priya",
    mmseScore: 21,
    cognitiveLevel: "Mild cognitive impairment",
    ageGroup: "75-84",
    referralSource: "Neurologist"
  },
  {
    id: "3",
    nhsNumber: "384 615 7230",
    patientName: "Jones, Margaret",
    mmseScore: 14,
    cognitiveLevel: "Moderate cognitive impairment",
    ageGroup: "85+",
    referralSource: "Geriatrician"
  },
  {
    id: "4",
    nhsNumber: "512 847 9063",
    patientName: "Williams, David",
    mmseScore: 30,
    cognitiveLevel: "Normal cognition",
    ageGroup: "65-74",
    referralSource: "GP"
  },
  {
    id: "5",
    nhsNumber: "167 293 8451",
    patientName: "Brown, Sarah",
    mmseScore: 7,
    cognitiveLevel: "Severe cognitive impairment",
    ageGroup: "85+",
    referralSource: "Psychiatrist"
  },
  {
    id: "6",
    nhsNumber: "835 162 4097",
    patientName: "Taylor, James",
    mmseScore: 24,
    cognitiveLevel: "Normal cognition",
    ageGroup: "75-84",
    referralSource: "GP"
  },
  {
    id: "7",
    nhsNumber: "294 708 5316",
    patientName: "Davies, Helen",
    mmseScore: 19,
    cognitiveLevel: "Mild cognitive impairment",
    ageGroup: "75-84",
    referralSource: "Family"
  },
  {
    id: "8",
    nhsNumber: "608 341 2975",
    patientName: "Wilson, Robert",
    mmseScore: 26,
    cognitiveLevel: "Normal cognition",
    ageGroup: "65-74",
    referralSource: "Self"
  },
  {
    id: "9",
    nhsNumber: "473 926 1084",
    patientName: "Evans, Catherine",
    mmseScore: 12,
    cognitiveLevel: "Moderate cognitive impairment",
    ageGroup: "85+",
    referralSource: "Geriatrician"
  },
  {
    id: "10",
    nhsNumber: "159 684 7302",
    patientName: "Thomas, Michael",
    mmseScore: 29,
    cognitiveLevel: "Normal cognition",
    ageGroup: "55-64",
    referralSource: "GP"
  },
  {
    id: "11",
    nhsNumber: "742 051 3896",
    patientName: "Robinson, Emma",
    mmseScore: 16,
    cognitiveLevel: "Moderate cognitive impairment",
    ageGroup: "75-84",
    referralSource: "Neurologist"
  },
  {
    id: "12",
    nhsNumber: "386 219 5740",
    patientName: "Clark, George",
    mmseScore: 5,
    cognitiveLevel: "Severe cognitive impairment",
    ageGroup: "85+",
    referralSource: "Geriatrician"
  },
  {
    id: "13",
    nhsNumber: "925 473 0168",
    patientName: "Walker, Susan",
    mmseScore: 22,
    cognitiveLevel: "Mild cognitive impairment",
    ageGroup: "65-74",
    referralSource: "GP"
  },
  {
    id: "14",
    nhsNumber: "618 305 9247",
    patientName: "Hall, Richard",
    mmseScore: 18,
    cognitiveLevel: "Mild cognitive impairment",
    ageGroup: "75-84",
    referralSource: "Psychiatrist"
  },
  {
    id: "15",
    nhsNumber: "057 842 6139",
    patientName: "Young, Elizabeth",
    mmseScore: 27,
    cognitiveLevel: "Normal cognition",
    ageGroup: "55-64",
    referralSource: "Self"
  }
];
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let patients$1 = patients;
    let searchTerm = "";
    let mmseFilter = "";
    let cognitiveLevelFilter = "";
    let ageGroupFilter = "";
    let referralSourceFilter = "";
    const mmseOptions = [
      { value: "", label: "All MMSE scores" },
      { value: "24-30", label: "Normal (24-30)" },
      { value: "18-23", label: "Mild (18-23)" },
      { value: "10-17", label: "Moderate (10-17)" },
      { value: "0-9", label: "Severe (0-9)" }
    ];
    const cognitiveLevelOptions = [
      { value: "", label: "All levels" },
      { value: "Normal cognition", label: "Normal cognition" },
      {
        value: "Mild cognitive impairment",
        label: "Mild cognitive impairment"
      },
      {
        value: "Moderate cognitive impairment",
        label: "Moderate cognitive impairment"
      },
      {
        value: "Severe cognitive impairment",
        label: "Severe cognitive impairment"
      }
    ];
    const ageGroupOptions = [
      { value: "", label: "All age groups" },
      { value: "55-64", label: "55-64" },
      { value: "65-74", label: "65-74" },
      { value: "75-84", label: "75-84" },
      { value: "85+", label: "85+" }
    ];
    const referralSourceOptions = [
      { value: "", label: "All referral sources" },
      { value: "GP", label: "GP" },
      { value: "Neurologist", label: "Neurologist" },
      { value: "Psychiatrist", label: "Psychiatrist" },
      { value: "Geriatrician", label: "Geriatrician" },
      { value: "Self", label: "Self" },
      { value: "Family", label: "Family" }
    ];
    function applyFilters() {
      return;
    }
    let hasActiveFilters = derived(() => referralSourceFilter !== "");
    $$renderer2.push(`<div class="min-h-screen bg-gray-50"><header class="bg-nhs-blue text-white shadow"><div class="mx-auto max-w-7xl px-4 py-4 sm:px-6"><h1 class="text-2xl font-bold">Cognitive Assessment — Clinician Dashboard</h1> <p class="mt-1 text-sm text-blue-100">Patient list with cognitive assessment status</p></div></header> <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6"><div class="mb-4 rounded-lg bg-white p-4 shadow-sm"><div class="flex flex-wrap items-end gap-4"><div class="min-w-[240px] flex-1"><label for="search" class="mb-1 block text-sm font-medium text-gray-700">Search</label> <input id="search" type="text" placeholder="NHS number, name, or cognitive level..."${attr("value", searchTerm)} class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"/></div> <div><label for="mmse-filter" class="mb-1 block text-sm font-medium text-gray-700">MMSE Score</label> `);
    $$renderer2.select(
      {
        id: "mmse-filter",
        value: mmseFilter,
        onchange: applyFilters,
        class: "rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(mmseOptions);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let opt = each_array[$$index];
          $$renderer3.option({ value: opt.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(opt.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div><label for="cognitive-filter" class="mb-1 block text-sm font-medium text-gray-700">Cognitive Level</label> `);
    $$renderer2.select(
      {
        id: "cognitive-filter",
        value: cognitiveLevelFilter,
        onchange: applyFilters,
        class: "rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(cognitiveLevelOptions);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let opt = each_array_1[$$index_1];
          $$renderer3.option({ value: opt.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(opt.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div><label for="age-filter" class="mb-1 block text-sm font-medium text-gray-700">Age Group</label> `);
    $$renderer2.select(
      {
        id: "age-filter",
        value: ageGroupFilter,
        onchange: applyFilters,
        class: "rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(ageGroupOptions);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let opt = each_array_2[$$index_2];
          $$renderer3.option({ value: opt.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(opt.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> <div><label for="referral-filter" class="mb-1 block text-sm font-medium text-gray-700">Referral Source</label> `);
    $$renderer2.select(
      {
        id: "referral-filter",
        value: referralSourceFilter,
        onchange: applyFilters,
        class: "rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array_3 = ensure_array_like(referralSourceOptions);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let opt = each_array_3[$$index_3];
          $$renderer3.option({ value: opt.value }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(opt.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div> `);
    if (hasActiveFilters()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Clear filters</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="rounded-lg bg-white shadow-sm" style="height: 600px;">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex h-full items-center justify-center text-muted">Loading patients...</div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-4 flex items-center gap-4 text-sm text-muted"><span>${escape_html(patients$1.length)} patients total</span> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></main></div>`);
  });
}
export {
  _page as default
};
