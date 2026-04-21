import type { RequestHandler } from '@sveltejs/kit';
import { store } from '$lib/stores/assessment.svelte.js';
import { buildPdfDoc } from '$lib/report/pdf-builder.js';

/**
 * Server endpoint that builds a PDF document definition and returns it as
 * JSON. In a production deployment this would be piped through pdfmake's
 * server bundle to emit application/pdf; for the scaffold we return the
 * doc definition which the client renders with pdfmake in the browser.
 */
export const GET: RequestHandler = async () => {
  const doc = buildPdfDoc(store.data, store.result);
  return new Response(JSON.stringify(doc, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
};
