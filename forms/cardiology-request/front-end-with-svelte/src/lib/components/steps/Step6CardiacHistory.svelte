<script lang="ts">
	import Field from '#lib/components/ui/Field.svelte';
	import Fieldset from '#lib/components/ui/Fieldset.svelte';
	import TextAreaInput from '#lib/components/ui/TextAreaInput.svelte';
	import CheckboxGroup from '#lib/components/ui/CheckboxGroup.svelte';
	import CheckboxInput from '#lib/components/ui/CheckboxInput.svelte';
	import { requestStore } from '#lib/stores/result.svelte.js';

	let d = $derived(requestStore.data);
</script>

<Fieldset legend="6. Cardiac History">
	<p class="hint">Cardiac history, risk factors, and current medications.</p>

	<Field label="History and risk factors">
		<CheckboxGroup label="History and risk factors">
			<label><CheckboxInput label="Known coronary artery disease" bind:checked={d.knownCoronaryArteryDisease} /> Known coronary artery disease</label>
			<label><CheckboxInput label="Previous myocardial infarction" bind:checked={d.previousMi} /> Previous myocardial infarction</label>
			<label><CheckboxInput label="Established heart failure" bind:checked={d.heartFailure} /> Established heart failure</label>
			<label><CheckboxInput label="Valve disease" bind:checked={d.valveDisease} /> Valve disease</label>
			<label><CheckboxInput label="Arrhythmia" bind:checked={d.arrhythmia} /> Arrhythmia</label>
			<label><CheckboxInput label="Hypertension" bind:checked={d.hypertension} /> Hypertension</label>
			<label><CheckboxInput label="Diabetes" bind:checked={d.diabetes} /> Diabetes</label>
		</CheckboxGroup>
	</Field>

	<Field label="Current medications" inputId="currentMedications">
		<TextAreaInput
			id="currentMedications"
			label="Current medications"
			rows={3}
			placeholder="Current cardiac and other relevant medications…"
			bind:value={d.currentMedications}
		/>
	</Field>
</Fieldset>
