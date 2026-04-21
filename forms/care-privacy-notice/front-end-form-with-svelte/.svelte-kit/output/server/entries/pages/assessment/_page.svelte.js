import "clsx";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import "../../../chunks/state.svelte.js";
import { S as Step1PracticeConfiguration, a as Step2PrivacyNotice, b as Step3AcknowledgmentSignature } from "../../../chunks/Step3AcknowledgmentSignature.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    Step1PracticeConfiguration($$renderer2);
    $$renderer2.push(`<!----> `);
    Step2PrivacyNotice($$renderer2);
    $$renderer2.push(`<!----> `);
    Step3AcknowledgmentSignature($$renderer2);
    $$renderer2.push(`<!----> <div class="mt-8 flex justify-end"><button type="button" class="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark">Submit</button></div>`);
  });
}
export {
  _page as default
};
