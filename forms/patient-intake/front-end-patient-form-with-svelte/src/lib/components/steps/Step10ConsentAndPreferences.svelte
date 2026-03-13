<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.consentAndPreferences;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Consent & Preferences" description="Please review and confirm your preferences">
	<RadioGroup
		label="Do you consent to treatment?"
		name="consentTreatment"
		options={yesNo}
		bind:value={c.consentToTreatment}
		required
	/>

	<RadioGroup
		label="Do you acknowledge our privacy notice and agree to the use of your data for clinical purposes?"
		name="privacyAck"
		options={yesNo}
		bind:value={c.privacyAcknowledgement}
		required
	/>

	<SelectInput
		label="Preferred communication method"
		name="commPref"
		options={[
			{ value: 'phone', label: 'Phone' },
			{ value: 'email', label: 'Email' },
			{ value: 'text', label: 'Text/SMS' },
			{ value: 'post', label: 'Post' }
		]}
		bind:value={c.communicationPreference}
	/>

	<RadioGroup
		label="Do you have any advance directives (living will, power of attorney for healthcare)?"
		name="advanceDirectives"
		options={yesNo}
		bind:value={c.advanceDirectives}
	/>
	{#if c.advanceDirectives === 'yes'}
		<TextArea label="Please provide details" name="directiveDetails" bind:value={c.advanceDirectiveDetails} />
	{/if}
</SectionCard>
