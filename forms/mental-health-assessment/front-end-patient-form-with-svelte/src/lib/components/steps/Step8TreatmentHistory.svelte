<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const t = assessment.data.treatmentHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Treatment History" description="Your previous and current mental health treatment">
	<RadioGroup
		label="Have you previously received therapy or counselling?"
		name="previousTherapy"
		options={yesNo}
		bind:value={t.previousTherapy}
	/>
	{#if t.previousTherapy === 'yes'}
		<TextArea
			label="Please describe (type of therapy, duration, outcome)"
			name="therapyDetails"
			bind:value={t.therapyDetails}
		/>
	{/if}

	<RadioGroup
		label="Have you ever been hospitalised for mental health reasons?"
		name="previousHospitalizations"
		options={yesNo}
		bind:value={t.previousHospitalizations}
	/>
	{#if t.previousHospitalizations === 'yes'}
		<TextArea
			label="Please describe (when, where, reason)"
			name="hospitalizationDetails"
			bind:value={t.hospitalizationDetails}
		/>
	{/if}

	<TextArea
		label="Current mental health providers (therapist, psychiatrist, etc.)"
		name="currentProviders"
		bind:value={t.currentProviders}
		placeholder="List any current providers and their roles"
	/>
</SectionCard>
