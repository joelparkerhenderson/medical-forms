<script lang="ts">
	import Field from '#lib/components/ui/Field.svelte';
	import Fieldset from '#lib/components/ui/Fieldset.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextAreaInput from '#lib/components/ui/TextAreaInput.svelte';
	import CheckboxGroup from '#lib/components/ui/CheckboxGroup.svelte';
	import CheckboxInput from '#lib/components/ui/CheckboxInput.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import { requestStore } from '#lib/stores/result.svelte.js';

	let d = $derived(requestStore.data);
</script>

<Fieldset legend="5. Red Flags and Investigations">
	<p class="hint">Acute red flags drive the safety axis and escalate triage. Record investigations already done.</p>

	<Field label="Acute red flags">
		<CheckboxGroup label="Acute red flags">
			<label><CheckboxInput label="Suspected acute coronary syndrome" bind:checked={d.suspectedAcs} /> Suspected acute coronary syndrome</label>
			<label><CheckboxInput label="Exertional syncope" bind:checked={d.exertionalSyncope} /> Exertional syncope</label>
			<label><CheckboxInput label="New-onset heart failure" bind:checked={d.newOnsetHeartFailure} /> New-onset heart failure</label>
		</CheckboxGroup>
	</Field>

	{#if d.suspectedAcs}
		<Alert type="error" heading="Suspected ACS — emergency pathway">
			<p>
				Suspected acute coronary syndrome auto-escalates triage to emergency. Divert to the
				emergency ACS pathway now; do not wait for a routine clinic.
			</p>
		</Alert>
	{:else if d.exertionalSyncope || d.newOnsetHeartFailure}
		<Alert type="warning" heading="Red flag selected">
			<p>
				This red flag auto-escalates triage to urgent and sets the safety axis to red-flag.
			</p>
		</Alert>
	{/if}

	<Field label="Resting ECG">
		<CheckboxGroup label="Resting ECG">
			<label><CheckboxInput label="Resting ECG performed" bind:checked={d.ecgDone} /> Resting ECG performed</label>
		</CheckboxGroup>
	</Field>

	{#if d.ecgDone}
		<Field label="ECG findings" inputId="ecgFindings">
			<TextAreaInput
				id="ecgFindings"
				label="ECG findings"
				rows={2}
				placeholder="e.g. Sinus rhythm, no acute ST changes…"
				bind:value={d.ecgFindings}
			/>
		</Field>
	{/if}

	<Field label="Troponin status" inputId="troponinStatus">
		<Select id="troponinStatus" label="Troponin status" bind:value={d.troponinStatus}>
			<option value="">Select…</option>
			<option value="elevated">Elevated</option>
			<option value="normal">Normal</option>
			<option value="not-done">Not done</option>
		</Select>
	</Field>

	<Field label="BNP / NT-proBNP status" inputId="bnpStatus">
		<Select id="bnpStatus" label="BNP / NT-proBNP status" bind:value={d.bnpStatus}>
			<option value="">Select…</option>
			<option value="elevated">Elevated</option>
			<option value="normal">Normal</option>
			<option value="not-done">Not done</option>
		</Select>
	</Field>
</Fieldset>
