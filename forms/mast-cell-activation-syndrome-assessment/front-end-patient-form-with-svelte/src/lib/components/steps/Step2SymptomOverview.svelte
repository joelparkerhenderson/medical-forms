<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const s = assessment.data.symptomOverview;
</script>

<SectionCard title="Symptom Overview" description="General information about your symptoms and their impact">
	<TextInput
		label="When did your symptoms first begin?"
		name="onsetDate"
		type="date"
		bind:value={s.onsetDate}
		required
	/>

	<TextInput
		label="How long have you had symptoms?"
		name="symptomDuration"
		bind:value={s.symptomDuration}
		placeholder="e.g., 6 months, 2 years, since childhood"
		required
	/>

	<SelectInput
		label="How often do you experience symptoms?"
		name="symptomFrequency"
		options={[
			{ value: 'rarely', label: 'Rarely (less than monthly)' },
			{ value: 'sometimes', label: 'Sometimes (monthly)' },
			{ value: 'often', label: 'Often (weekly)' },
			{ value: 'daily', label: 'Daily' }
		]}
		bind:value={s.symptomFrequency}
		required
	/>

	<SelectInput
		label="How much do symptoms affect your quality of life?"
		name="qualityOfLife"
		options={[
			{ value: 'none', label: 'No impact' },
			{ value: 'mild', label: 'Mild impact - can manage daily activities' },
			{ value: 'moderate', label: 'Moderate impact - some activities limited' },
			{ value: 'severe', label: 'Severe impact - significantly limited' }
		]}
		bind:value={s.qualityOfLife}
		required
	/>
</SectionCard>
