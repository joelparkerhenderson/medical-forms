<script lang="ts">
	import Field from '#lib/components/ui/Field.svelte';
	import Fieldset from '#lib/components/ui/Fieldset.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import CheckboxGroup from '#lib/components/ui/CheckboxGroup.svelte';
	import CheckboxInput from '#lib/components/ui/CheckboxInput.svelte';
	import { requestStore } from '#lib/stores/result.svelte.js';

	let d = $derived(requestStore.data);
</script>

<Fieldset legend="4. Symptoms">
	<p class="hint">Presenting symptoms, chest-pain character, and functional class.</p>

	<Field label="Symptoms present">
		<CheckboxGroup label="Symptoms present">
			<label><CheckboxInput label="Chest pain" bind:checked={d.symptomChestPain} /> Chest pain</label>
			<label><CheckboxInput label="Breathlessness" bind:checked={d.symptomBreathlessness} /> Breathlessness</label>
			<label><CheckboxInput label="Palpitations" bind:checked={d.symptomPalpitations} /> Palpitations</label>
			<label><CheckboxInput label="Syncope / blackout" bind:checked={d.symptomSyncope} /> Syncope / blackout</label>
			<label><CheckboxInput label="Peripheral oedema" bind:checked={d.symptomOedema} /> Peripheral oedema</label>
		</CheckboxGroup>
	</Field>

	{#if d.symptomChestPain}
		<Field label="Chest pain character" inputId="chestPainCharacter" description="Angina typicality model.">
			<Select id="chestPainCharacter" label="Chest pain character" bind:value={d.chestPainCharacter}>
				<option value="">Select…</option>
				<option value="typical-angina">Typical angina</option>
				<option value="atypical">Atypical</option>
				<option value="non-anginal">Non-anginal</option>
				<option value="none">None</option>
			</Select>
		</Field>
	{/if}

	{#if d.symptomBreathlessness}
		<Field label="NYHA functional class" inputId="nyhaClass" description="New York Heart Association class for breathlessness.">
			<Select id="nyhaClass" label="NYHA functional class" bind:value={d.nyhaClass}>
				<option value="">Select…</option>
				<option value="i">Class I — no limitation</option>
				<option value="ii">Class II — slight limitation</option>
				<option value="iii">Class III — marked limitation</option>
				<option value="iv">Class IV — symptoms at rest</option>
			</Select>
		</Field>
	{/if}
</Fieldset>
