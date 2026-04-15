import { a1 as attr, a2 as attr_class, a3 as clsx, e as escape_html, a0 as derived, a4 as stringify, a5 as ensure_array_like } from "../../chunks/renderer.js";
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
const acknowledgments = [
  { id: "1", patientName: "Smith, John", nhsNumber: "943 476 5919", dateAcknowledged: "2026-04-15", status: "complete", practiceName: "Riverside Medical Practice" },
  { id: "2", patientName: "Patel, Priya", nhsNumber: "721 938 4102", dateAcknowledged: "2026-04-14", status: "complete", practiceName: "Riverside Medical Practice" },
  { id: "3", patientName: "Jones, Margaret", nhsNumber: "384 615 7230", dateAcknowledged: "2026-04-13", status: "incomplete", practiceName: "Hillside Surgery" },
  { id: "4", patientName: "Williams, David", nhsNumber: "512 847 9063", dateAcknowledged: "2026-04-12", status: "complete", practiceName: "Hillside Surgery" },
  { id: "5", patientName: "Brown, Sarah", nhsNumber: "167 293 8451", dateAcknowledged: "2026-04-11", status: "complete", practiceName: "The Green Practice" },
  { id: "6", patientName: "Taylor, James", nhsNumber: "835 162 4097", dateAcknowledged: "2026-04-10", status: "incomplete", practiceName: "The Green Practice" },
  { id: "7", patientName: "Davies, Helen", nhsNumber: "294 708 5316", dateAcknowledged: "2026-04-09", status: "complete", practiceName: "Riverside Medical Practice" },
  { id: "8", patientName: "Wilson, Robert", nhsNumber: "608 341 2975", dateAcknowledged: "2026-04-08", status: "complete", practiceName: "Lakeside Health Centre" },
  { id: "9", patientName: "Evans, Catherine", nhsNumber: "473 926 1084", dateAcknowledged: "2026-04-07", status: "complete", practiceName: "Lakeside Health Centre" },
  { id: "10", patientName: "Thomas, Michael", nhsNumber: "159 684 7302", dateAcknowledged: "2026-04-06", status: "incomplete", practiceName: "Riverside Medical Practice" },
  { id: "11", patientName: "Robinson, Emma", nhsNumber: "742 051 3896", dateAcknowledged: "2026-04-05", status: "complete", practiceName: "The Green Practice" },
  { id: "12", patientName: "Clark, George", nhsNumber: "386 219 5740", dateAcknowledged: "2026-04-04", status: "complete", practiceName: "Hillside Surgery" },
  { id: "13", patientName: "Walker, Susan", nhsNumber: "925 473 0168", dateAcknowledged: "2026-04-03", status: "complete", practiceName: "Riverside Medical Practice" },
  { id: "14", patientName: "Hall, Richard", nhsNumber: "618 305 9247", dateAcknowledged: "2026-04-02", status: "incomplete", practiceName: "Lakeside Health Centre" },
  { id: "15", patientName: "Young, Elizabeth", nhsNumber: "057 842 6139", dateAcknowledged: "2026-04-01", status: "complete", practiceName: "The Green Practice" }
];
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let rows = acknowledgments;
    let searchTerm = "";
    let statusFilter = "";
    const statusOptions = [
      { value: "", label: "All Status" },
      { value: "complete", label: "Complete" },
      { value: "incomplete", label: "Incomplete" }
    ];
    function applyFilters() {
      return;
    }
    let hasActiveFilters = derived(() => statusFilter !== "");
    $$renderer2.push(`<div class="min-h-screen bg-gray-50"><header class="bg-nhs-blue text-white shadow"><div class="mx-auto max-w-7xl px-4 py-4 sm:px-6"><h1 class="text-2xl font-bold">Care Privacy Notice — Clinician Dashboard</h1> <p class="mt-1 text-sm text-blue-100">Patient privacy notice acknowledgments</p></div></header> <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6"><div class="mb-4 rounded-lg bg-white p-4 shadow-sm"><div class="flex flex-wrap items-end gap-4"><div class="min-w-[240px] flex-1"><label for="search" class="mb-1 block text-sm font-medium text-gray-700">Search</label> <input id="search" type="text" placeholder="Name or NHS number..."${attr("value", searchTerm)} class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"/></div> <div><label for="status-filter" class="mb-1 block text-sm font-medium text-gray-700">Status</label> `);
    $$renderer2.select(
      {
        id: "status-filter",
        value: statusFilter,
        onchange: applyFilters,
        class: "rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(statusOptions);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let opt = each_array[$$index];
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
      $$renderer2.push(`<div class="flex h-full items-center justify-center text-muted">Loading acknowledgments...</div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="mt-4 flex items-center gap-4 text-sm text-muted"><span>${escape_html(rows.length)} patients total</span> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></main></div>`);
  });
}
export {
  _page as default
};
