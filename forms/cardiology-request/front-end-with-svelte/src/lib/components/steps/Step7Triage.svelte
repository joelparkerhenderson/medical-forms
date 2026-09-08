<script lang="ts">
	import Field from '#lib/components/ui/Field.svelte';
	import Fieldset from '#lib/components/ui/Fieldset.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextInput from '#lib/components/ui/TextInput.svelte';
	import DateInput from '#lib/components/ui/DateInput.svelte';
	import { requestStore } from '#lib/stores/result.svelte.js';

	let d = $derived(requestStore.data);
</script>

<Fieldset legend="7. Triage">
	<p class="hint">The requested urgency, the requested-by date, and the care setting.</p>

	<Field label="Requested urgency" inputId="urgency" description="The engine may escalate this if a red flag is present, but will not lower it.">
		<Select id="urgency" label="Requested urgency" bind:value={d.urgency}>
			<option value="routine">Routine</option>
			<option value="urgent">Urgent</option>
			<option value="emergency">Emergency</option>
		</Select>
	</Field>

	<Field label="Requested-by date" inputId="requestedByDate" description="Date by which the patient should be seen.">
		<DateInput id="requestedByDate" label="Requested-by date" bind:value={d.requestedByDate} />
	</Field>

	<Field label="Care setting" inputId="setting">
		<Select id="setting" label="Care setting" bind:value={d.setting}>
			<option value="">Select…</option>
			<option value="outpatient">Outpatient</option>
			<option value="inpatient">Inpatient</option>
			<option value="community">Community</option>
			<option value="emergency">Emergency</option>
		</Select>
	</Field>

	<Field label="Referring site / practice / ward" inputId="siteName">
		<TextInput
			id="siteName"
			label="Referring site / practice / ward"
			placeholder="e.g. Headington Medical Practice"
			bind:value={d.siteName}
		/>
	</Field>
</Fieldset>
