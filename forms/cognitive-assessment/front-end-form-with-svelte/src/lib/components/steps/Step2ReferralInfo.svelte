<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const r = assessment.data.referralInformation;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Referral Information" description="Details about why and by whom the patient was referred">
	<SelectInput
		label="Referral Source"
		name="referralSource"
		options={[
			{ value: 'gp', label: 'General Practitioner (GP)' },
			{ value: 'neurologist', label: 'Neurologist' },
			{ value: 'psychiatrist', label: 'Psychiatrist' },
			{ value: 'geriatrician', label: 'Geriatrician' },
			{ value: 'self', label: 'Self-referral' },
			{ value: 'family', label: 'Family member' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={r.referralSource}
		required
	/>

	<SelectInput
		label="Reason for Referral"
		name="referralReason"
		options={[
			{ value: 'memory-concern', label: 'Memory concern' },
			{ value: 'confusion', label: 'Confusion/disorientation' },
			{ value: 'behavioural-change', label: 'Behavioural change' },
			{ value: 'functional-decline', label: 'Functional decline' },
			{ value: 'screening', label: 'Routine screening' },
			{ value: 'follow-up', label: 'Follow-up assessment' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={r.referralReason}
		required
	/>

	<TextInput
		label="Referring Clinician"
		name="referringClinician"
		bind:value={r.referringClinician}
		placeholder="Name of referring clinician"
	/>

	<TextInput label="Referral Date" name="referralDate" type="date" bind:value={r.referralDate} />

	<RadioGroup
		label="Urgency"
		name="urgency"
		options={[
			{ value: 'routine', label: 'Routine' },
			{ value: 'urgent', label: 'Urgent' },
			{ value: 'emergency', label: 'Emergency' }
		]}
		bind:value={r.urgency}
	/>

	<RadioGroup
		label="Has the patient had a previous cognitive assessment?"
		name="previousAssessment"
		options={yesNo}
		bind:value={r.previousCognitiveAssessment}
	/>
	{#if r.previousCognitiveAssessment === 'yes'}
		<TextArea
			label="Previous assessment details (date, score, findings)"
			name="previousAssessmentDetails"
			bind:value={r.previousAssessmentDetails}
			placeholder="e.g., MMSE 22/30 on 2025-01-15, mild impairment noted..."
		/>
	{/if}
</SectionCard>
