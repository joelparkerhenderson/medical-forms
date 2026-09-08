<script lang="ts">
	// FormDataTransfer — wizard-level export (JSON/XML/CSV/TSV download of
	// the current, possibly in-progress, state) + import (JSON upload
	// re-populates the wizard).
	//
	// Form-agnostic: the caller supplies `slug`, `getState`, and `setState`
	// rather than this component knowing any form's state shape -- the same
	// uniform contract the vanilla-JS front-end's window.__FORM_STATE__
	// exposes for js/form-export.js / js/form-import.js. `setState` must
	// merge the imported object onto a fresh default state (tolerating a
	// partial or foreign-shaped file) and reset any derived/result state,
	// the same way the store's own localStorage restore already does --
	// this component only parses the file and hands the result off.
	import {
		toJson,
		toXml,
		toDelimited,
		slugToXmlName,
		triggerDownload,
		todayIso,
		parseImportedJson
	} from '#lib/utils/form-data-transfer.js';
	import Button from './Button.svelte';

	let {
		slug,
		getState,
		setState
	}: {
		slug: string;
		// `unknown`, not `Record<string, unknown>`: a form's own state type
		// (e.g. CardiologyRequest) has no index signature, so TypeScript
		// would otherwise reject every real caller. Cast at the point of use
		// below instead -- export/import both walk whatever shape they are
		// actually given, so the runtime behaviour is identical either way.
		getState: () => unknown;
		setState: (parsed: Record<string, unknown>) => void;
	} = $props();

	let status = $state('');
	let fileInput: HTMLInputElement | undefined = $state();

	function downloadJson() {
		triggerDownload(toJson(getState()), 'application/json', `${slug}-${todayIso()}.json`);
	}
	function downloadXml() {
		triggerDownload(
			toXml(slugToXmlName(slug), getState() as Record<string, unknown>),
			'application/xml',
			`${slug}-${todayIso()}.xml`
		);
	}
	function downloadCsv() {
		triggerDownload(
			toDelimited(getState() as Record<string, unknown>, ','),
			'text/csv',
			`${slug}-${todayIso()}.csv`
		);
	}
	function downloadTsv() {
		triggerDownload(
			toDelimited(getState() as Record<string, unknown>, '\t'),
			'text/tab-separated-values',
			`${slug}-${todayIso()}.tsv`
		);
	}

	function triggerImport() {
		fileInput?.click();
	}

	function onFileChosen(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		if (!confirm('Importing will replace everything currently entered in this form. Continue?')) {
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const parsed = parseImportedJson(String(reader.result));
			if (!parsed) {
				status = 'Could not read that file: expected a JSON object.';
				return;
			}
			setState(parsed);
			status = `Form imported from ${file.name}.`;
		};
		reader.onerror = () => {
			status = 'Could not read that file.';
		};
		reader.readAsText(file);
	}
</script>

<div class="form-data-bar no-print flex flex-wrap items-center gap-2 mb-4" role="group" aria-label="Export or import this form">
	<Button data-variant="secondary" onclick={downloadJson}>Download JSON</Button>
	<Button data-variant="secondary" onclick={downloadXml}>Download XML</Button>
	<Button data-variant="secondary" onclick={downloadCsv}>Download CSV</Button>
	<Button data-variant="secondary" onclick={downloadTsv}>Download TSV</Button>
	<Button data-variant="secondary" onclick={triggerImport}>Import JSON</Button>
	<input
		bind:this={fileInput}
		type="file"
		accept="application/json,.json"
		class="sr-only"
		onchange={onFileChosen}
	/>
	<span role="status" aria-live="polite" class={status ? '' : 'sr-only'}>{status}</span>
</div>
