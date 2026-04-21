<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const lp = assessment.data.liverPancreas;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Liver & Pancreas" description="Hepatobiliary and pancreatic symptoms">
	<RadioGroup label="Have you noticed yellowing of the skin or eyes (jaundice)?" name="jaundice" options={yesNo} bind:value={lp.jaundice} />

	<RadioGroup label="Have you noticed dark-coloured urine?" name="darkUrine" options={yesNo} bind:value={lp.darkUrine} />

	<RadioGroup label="Have you noticed pale or clay-coloured stools?" name="paleStools" options={yesNo} bind:value={lp.paleStools} />

	<SelectInput
		label="How would you describe your alcohol intake?"
		name="alcoholIntake"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional (1-7 units/week)' },
			{ value: 'moderate', label: 'Moderate (8-14 units/week)' },
			{ value: 'heavy', label: 'Heavy (>14 units/week)' }
		]}
		bind:value={lp.alcoholIntake}
	/>

	{#if lp.alcoholIntake && lp.alcoholIntake !== 'none'}
		<NumberInput label="Units per week" name="alcoholUnits" bind:value={lp.alcoholUnitsPerWeek} min={0} max={200} />
	{/if}

	<RadioGroup label="Have you been exposed to hepatitis (e.g. travel, contact, injection)?" name="hepatitis" options={yesNo} bind:value={lp.hepatitisExposure} />
	{#if lp.hepatitisExposure === 'yes'}
		<TextInput label="Please provide details" name="hepatitisDetails" bind:value={lp.hepatitisDetails} />
	{/if}
</SectionCard>
