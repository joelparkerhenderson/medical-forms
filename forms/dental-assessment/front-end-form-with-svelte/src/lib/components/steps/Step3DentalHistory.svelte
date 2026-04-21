<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.dentalHistory;
</script>

<SectionCard title="Dental History" description="Your dental care habits and history">
	<TextInput label="Date of last dental visit" name="lastDentalVisit" type="date" bind:value={d.lastDentalVisit} />

	<SelectInput
		label="How often do you visit the dentist?"
		name="visitFrequency"
		options={[
			{ value: 'every-6-months', label: 'Every 6 months' },
			{ value: 'annually', label: 'Annually' },
			{ value: 'rarely', label: 'Rarely' },
			{ value: 'never', label: 'Never' }
		]}
		bind:value={d.visitFrequency}
	/>

	<SelectInput
		label="How often do you brush your teeth?"
		name="brushingFrequency"
		options={[
			{ value: 'twice-daily', label: 'Twice daily' },
			{ value: 'once-daily', label: 'Once daily' },
			{ value: 'occasionally', label: 'Occasionally' },
			{ value: 'rarely', label: 'Rarely' }
		]}
		bind:value={d.brushingFrequency}
	/>

	<SelectInput
		label="How often do you floss?"
		name="flossingFrequency"
		options={[
			{ value: 'daily', label: 'Daily' },
			{ value: 'occasionally', label: 'Occasionally' },
			{ value: 'rarely', label: 'Rarely' },
			{ value: 'never', label: 'Never' }
		]}
		bind:value={d.flossingFrequency}
	/>

	<RadioGroup
		label="Level of dental anxiety"
		name="dentalAnxietyLevel"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'mild', label: 'Mild' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'severe', label: 'Severe' }
		]}
		bind:value={d.dentalAnxietyLevel}
	/>
</SectionCard>
