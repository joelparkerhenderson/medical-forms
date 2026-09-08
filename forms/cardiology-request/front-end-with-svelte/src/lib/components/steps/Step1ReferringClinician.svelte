<script lang="ts">
	import Field from '#lib/components/ui/Field.svelte';
	import Fieldset from '#lib/components/ui/Fieldset.svelte';
	import TextInput from '#lib/components/ui/TextInput.svelte';
	import DateInput from '#lib/components/ui/DateInput.svelte';
	import { requestStore } from '#lib/stores/result.svelte.js';

	let d = $derived(requestStore.data);
</script>

<Fieldset legend="1. Referring Clinician">
	<p class="hint">Who is making the referral, their registration, and contact details.</p>

	<Field label="Referring clinician" inputId="referringClinician" required>
		<TextInput
			id="referringClinician"
			label="Referring clinician"
			placeholder="e.g. Dr Sarah Owen"
			bind:value={d.referringClinician}
			required
		/>
	</Field>

	<Field label="Role" inputId="referrerRole">
		<TextInput
			id="referrerRole"
			label="Role"
			placeholder="e.g. GP, hospital doctor, specialist nurse"
			bind:value={d.referrerRole}
		/>
	</Field>

	<Field label="Registration body" inputId="registrationBody">
		<TextInput
			id="registrationBody"
			label="Registration body"
			placeholder="e.g. GMC, NMC"
			bind:value={d.registrationBody}
		/>
	</Field>

	<Field label="Registration number" inputId="registrationNumber">
		<TextInput
			id="registrationNumber"
			label="Registration number"
			placeholder="e.g. 7012345"
			bind:value={d.registrationNumber}
		/>
	</Field>

	<Field label="Supervising consultant" inputId="supervisingConsultant" description="If the referrer is in training.">
		<TextInput
			id="supervisingConsultant"
			label="Supervising consultant"
			bind:value={d.supervisingConsultant}
		/>
	</Field>

	<Field label="Referrer contact" inputId="requesterContact" description="For any vetting queries.">
		<TextInput
			id="requesterContact"
			label="Referrer contact"
			placeholder="e.g. email or bleep"
			bind:value={d.requesterContact}
		/>
	</Field>

	<Field label="Referral date" inputId="referralDate">
		<DateInput id="referralDate" label="Referral date" bind:value={d.referralDate} />
	</Field>
</Fieldset>
