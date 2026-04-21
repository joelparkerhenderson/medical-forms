<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.coughAssessment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cough Assessment" description="Cough characteristics and sputum">
	<TextInput
		label="Cough Duration"
		name="coughDuration"
		bind:value={c.duration}
		placeholder="e.g. 2 weeks, 6 months, chronic"
	/>

	<RadioGroup
		label="Cough Character"
		name="coughCharacter"
		options={[
			{ value: 'productive', label: 'Productive (with sputum)' },
			{ value: 'dry', label: 'Dry (no sputum)' }
		]}
		bind:value={c.character}
	/>

	{#if c.character === 'productive'}
		<SelectInput
			label="Sputum Volume"
			name="sputumVolume"
			options={[
				{ value: 'small', label: 'Small (teaspoon)' },
				{ value: 'moderate', label: 'Moderate (tablespoon)' },
				{ value: 'large', label: 'Large (egg-cup or more)' }
			]}
			bind:value={c.sputumVolume}
		/>

		<SelectInput
			label="Sputum Colour"
			name="sputumColour"
			options={[
				{ value: 'clear', label: 'Clear' },
				{ value: 'white', label: 'White/Mucoid' },
				{ value: 'yellow', label: 'Yellow' },
				{ value: 'green', label: 'Green' },
				{ value: 'brown', label: 'Brown/Rusty' },
				{ value: 'blood-streaked', label: 'Blood-streaked' }
			]}
			bind:value={c.sputumColour}
		/>
	{/if}

	<RadioGroup label="Have you coughed up blood (haemoptysis)?" name="haemoptysis" options={yesNo} bind:value={c.haemoptysis} />
	{#if c.haemoptysis === 'yes'}
		<TextArea
			label="Haemoptysis Details"
			name="haemoptysisDetails"
			bind:value={c.haemoptysisDetails}
			placeholder="Describe frequency, volume, and colour..."
		/>
	{/if}
</SectionCard>
