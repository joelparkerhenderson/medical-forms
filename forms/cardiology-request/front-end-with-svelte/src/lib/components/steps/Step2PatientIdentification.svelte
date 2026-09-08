<script lang="ts">
	import Field from '#lib/components/ui/Field.svelte';
	import Fieldset from '#lib/components/ui/Fieldset.svelte';
	import TextInput from '#lib/components/ui/TextInput.svelte';
	import DateInput from '#lib/components/ui/DateInput.svelte';
	import { requestStore } from '#lib/stores/result.svelte.js';

	let d = $derived(requestStore.data);
</script>

<Fieldset legend="2. Patient Identification">
	<p class="hint">Who the referral is for.</p>

	<Field label="NHS number" inputId="nhsNumber" required>
		<TextInput
			id="nhsNumber"
			label="NHS number"
			placeholder="e.g. 485 777 3456"
			bind:value={d.nhsNumber}
			required
		/>
	</Field>

	<Field label="Patient name" inputId="patientName">
		<TextInput
			id="patientName"
			label="Patient name"
			placeholder="Full name"
			bind:value={d.patientName}
		/>
	</Field>

	<Field label="Date of birth" inputId="dateOfBirth">
		<DateInput id="dateOfBirth" label="Date of birth" bind:value={d.dateOfBirth} />
	</Field>
</Fieldset>
