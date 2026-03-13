<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const n = assessment.data.neurogenetics;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Neurogenetics" description="Family history of inherited neurological conditions">
	<RadioGroup label="Is there a family history of Huntington disease?" name="huntington" options={yesNo} bind:value={n.huntington} />

	<RadioGroup label="Is there a family history of early-onset Alzheimer disease (before age 65)?" name="alzheimersEarly" options={yesNo} bind:value={n.alzheimersEarly} />

	<RadioGroup label="Is there a family history of Parkinson disease?" name="parkinson" options={yesNo} bind:value={n.parkinson} />

	<RadioGroup label="Is there a family history of muscular dystrophy?" name="muscularDystrophy" options={yesNo} bind:value={n.muscularDystrophy} />

	<RadioGroup label="Is there a family history of spinocerebellar ataxia?" name="spinocerebellarAtaxia" options={yesNo} bind:value={n.spinocerebellarAtaxia} />

	<TextArea
		label="Additional neurological genetic details"
		name="neurologicalDetails"
		bind:value={n.neurologicalDetails}
		placeholder="Provide any additional details about neurological conditions in the family..."
	/>
</SectionCard>
