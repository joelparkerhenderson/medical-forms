<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const t = assessment.data.triggers;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Triggers" description="What triggers or worsens your asthma symptoms?">
	<RadioGroup label="Do allergens trigger your asthma? (dust mites, pollen, mold, pet dander)" name="allergens" options={yesNo} bind:value={t.allergens} />
	{#if t.allergens === 'yes'}
		<TextInput label="Which allergens?" name="allergenDetails" bind:value={t.allergenDetails} />
	{/if}

	<RadioGroup label="Does exercise trigger your asthma?" name="exercise" options={yesNo} bind:value={t.exercise} />

	<RadioGroup label="Does weather or temperature change trigger your asthma?" name="weather" options={yesNo} bind:value={t.weather} />
	{#if t.weather === 'yes'}
		<TextInput label="Details (cold air, humidity, etc.)" name="weatherDetails" bind:value={t.weatherDetails} />
	{/if}

	<RadioGroup label="Do you have occupational triggers?" name="occupational" options={yesNo} bind:value={t.occupational} />
	{#if t.occupational === 'yes'}
		<TextInput label="What are the occupational triggers?" name="occupationalDetails" bind:value={t.occupationalDetails} />
	{/if}

	<RadioGroup label="Do respiratory infections worsen your asthma?" name="infections" options={yesNo} bind:value={t.infections} />

	<RadioGroup label="Does smoke exposure trigger your asthma?" name="smoke" options={yesNo} bind:value={t.smoke} />

	<RadioGroup label="Does stress or strong emotions trigger your asthma?" name="stress" options={yesNo} bind:value={t.stress} />

	<RadioGroup label="Do any medications trigger your asthma? (e.g., aspirin, beta-blockers)" name="medications" options={yesNo} bind:value={t.medications} />
	{#if t.medications === 'yes'}
		<TextInput label="Which medications?" name="medicationDetails" bind:value={t.medicationDetails} />
	{/if}

	<TextArea
		label="Other triggers"
		name="otherTriggers"
		bind:value={t.otherTriggers}
		placeholder="Any other triggers not listed above..."
	/>
</SectionCard>
