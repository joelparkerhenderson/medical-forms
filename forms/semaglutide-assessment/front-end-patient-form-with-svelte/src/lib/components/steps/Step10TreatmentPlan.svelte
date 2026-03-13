<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const tp = assessment.data.treatmentPlan;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Treatment Plan" description="Proposed semaglutide treatment plan and monitoring schedule">
	<RadioGroup
		label="Selected Formulation"
		name="selectedFormulation"
		options={[
			{ value: 'subcutaneous-weekly', label: 'Subcutaneous (weekly injection)' },
			{ value: 'oral-daily', label: 'Oral (daily tablet)' }
		]}
		bind:value={tp.selectedFormulation}
	/>

	<SelectInput
		label="Starting Dose"
		name="startingDose"
		options={[
			{ value: '0.25mg', label: '0.25 mg (initiation dose)' },
			{ value: '0.5mg', label: '0.5 mg' },
			{ value: '1mg', label: '1 mg' },
			{ value: '3mg-oral', label: '3 mg oral (initiation dose)' },
			{ value: '7mg-oral', label: '7 mg oral' },
			{ value: '14mg-oral', label: '14 mg oral' }
		]}
		bind:value={tp.startingDose}
	/>

	<TextInput
		label="Titration Schedule"
		name="titrationSchedule"
		bind:value={tp.titrationSchedule}
		placeholder="e.g., Increase dose every 4 weeks per standard protocol"
	/>

	<SelectInput
		label="Monitoring Frequency"
		name="monitoringFrequency"
		options={[
			{ value: 'Weekly', label: 'Weekly' },
			{ value: 'Fortnightly', label: 'Fortnightly' },
			{ value: 'Monthly', label: 'Monthly' },
			{ value: 'Quarterly', label: 'Quarterly' }
		]}
		bind:value={tp.monitoringFrequency}
	/>

	<RadioGroup label="Dietary guidance provided?" name="dietaryGuidance" options={yesNoOptions} bind:value={tp.dietaryGuidance} />
	<RadioGroup label="Exercise plan discussed?" name="exercisePlan" options={yesNoOptions} bind:value={tp.exercisePlan} />

	<NumberInput
		label="Follow-up Appointment"
		name="followUpWeeks"
		bind:value={tp.followUpWeeks}
		min={1}
		max={52}
		step={1}
		unit="weeks"
	/>
</SectionCard>
