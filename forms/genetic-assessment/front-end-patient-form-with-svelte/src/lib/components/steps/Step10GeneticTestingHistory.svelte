<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const g = assessment.data.geneticTestingHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Genetic Testing History" description="Previous genetic tests and counseling history">
	<RadioGroup label="Have you had any previous genetic tests?" name="previousGeneticTests" options={yesNo} bind:value={g.previousGeneticTests} />
	{#if g.previousGeneticTests === 'yes'}
		<TextArea
			label="What tests were performed?"
			name="previousGeneticTestsDetails"
			bind:value={g.previousGeneticTestsDetails}
			placeholder="e.g., BRCA panel, carrier screening, whole exome sequencing..."
		/>

		<TextArea
			label="Test results"
			name="testResults"
			bind:value={g.testResults}
			placeholder="Describe the results (positive, negative, inconclusive)..."
		/>
	{/if}

	<RadioGroup label="Have you previously received genetic counseling?" name="geneticCounseling" options={yesNo} bind:value={g.geneticCounseling} />

	<RadioGroup label="Have any variants of uncertain significance (VUS) been identified?" name="variantsOfUncertainSignificance" options={yesNo} bind:value={g.variantsOfUncertainSignificance} />
	{#if g.variantsOfUncertainSignificance === 'yes'}
		<TextArea
			label="Please provide details about the VUS"
			name="variantsOfUncertainSignificanceDetails"
			bind:value={g.variantsOfUncertainSignificanceDetails}
			placeholder="Gene name, variant, classification..."
		/>
	{/if}
</SectionCard>
