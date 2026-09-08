// Form export/import — generic JSON / XML / CSV / TSV serialisation of a
// filled (or in-progress) wizard state, and JSON parsing for import.
//
// Pure, stack-agnostic functions consumed by
// `src/lib/components/ui/FormDataTransfer.svelte`. Mirrors the vanilla-JS
// front-end's js/form-export.js + js/form-import.js — same output shapes,
// same `<slug>-<date>.<ext>` filename convention — so the two stacks'
// exports are interchangeable.

/** Today's date as an ISO `yyyy-mm-dd` string, for the export filename. */
export function todayIso(): string {
	return new Date().toISOString().slice(0, 10);
}

/** Trigger a browser download of `text` as `filename`. Browser-only. */
export function triggerDownload(text: string, mime: string, filename: string): void {
	const blob = new Blob([text], { type: `${mime};charset=utf-8` });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/** Pretty-printed JSON. */
export function toJson(state: unknown): string {
	return JSON.stringify(state, null, 2) + '\n';
}

// ─── XML ───

function xmlEscape(value: unknown): string {
	return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// A field/section name is already a JS identifier (camelCase, per this
// monorepo's convention), so it is already a valid XML element name -- no
// name-mangling needed.
function valueToXml(name: string, value: unknown, depth: number): string {
	const pad = '  '.repeat(depth);
	if (value === null || value === undefined || value === '') {
		return `${pad}<${name}/>\n`;
	}
	if (Array.isArray(value)) {
		if (value.length === 0) return `${pad}<${name}/>\n`;
		return value.map((item) => valueToXml(name, item, depth)).join('');
	}
	if (typeof value === 'object') {
		const obj = value as Record<string, unknown>;
		const inner = Object.keys(obj)
			.map((k) => valueToXml(k, obj[k], depth + 1))
			.join('');
		return `${pad}<${name}>\n${inner}${pad}</${name}>\n`;
	}
	return `${pad}<${name}>${xmlEscape(value)}</${name}>\n`;
}

/** Slugified kebab-case name -> a valid XML element / camelCase name. */
export function slugToXmlName(slug: string): string {
	return slug
		.split('-')
		.map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
		.join('');
}

/** Generic recursive object -> XML document. `rootName` wraps the whole state. */
export function toXml(rootName: string, state: Record<string, unknown>): string {
	const inner = Object.keys(state)
		.map((k) => valueToXml(k, state[k], 1))
		.join('');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${inner}</${rootName}>\n`;
}

// ─── CSV / TSV ───
//
// A filled form is a single record, not a row list (unlike a dashboard's
// CSV/TSV export) -- flattened to one header row of dot/bracket field
// paths and one data row of values.

function flatten(value: unknown, prefix: string, out: Record<string, string>): void {
	if (value === null || value === undefined) {
		out[prefix] = '';
	} else if (Array.isArray(value)) {
		if (value.length === 0) {
			out[prefix] = '';
		} else {
			value.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out));
		}
	} else if (typeof value === 'object') {
		const obj = value as Record<string, unknown>;
		for (const k of Object.keys(obj)) {
			flatten(obj[k], prefix ? `${prefix}.${k}` : k, out);
		}
	} else {
		out[prefix] = String(value);
	}
}

function escapeField(value: string, sep: string): string {
	if (value.includes('"') || value.includes('\n') || value.includes(sep)) {
		return '"' + value.replace(/"/g, '""') + '"';
	}
	return value;
}

/** Flattened header row + one data row, delimiter-separated. */
export function toDelimited(state: Record<string, unknown>, sep: string): string {
	const flat: Record<string, string> = {};
	flatten(state, '', flat);
	const keys = Object.keys(flat);
	const header = keys.map((k) => escapeField(k, sep)).join(sep);
	const row = keys.map((k) => escapeField(flat[k], sep)).join(sep);
	return header + '\r\n' + row + '\r\n';
}

/** Parse an uploaded file's text as a JSON object; null if not one. */
export function parseImportedJson(text: string): Record<string, unknown> | null {
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		return null;
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
	return parsed as Record<string, unknown>;
}
