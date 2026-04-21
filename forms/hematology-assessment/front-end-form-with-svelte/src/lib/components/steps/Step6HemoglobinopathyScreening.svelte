<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.hemoglobinopathyScreening;

	const screenOptions = [
		{ value: 'negative', label: 'Negative' },
		{ value: 'positive', label: 'Positive' },
		{ value: 'notPerformed', label: 'Not Performed' }
	];
</script>

<SectionCard title="Hemoglobinopathy Screening" description="Enter hemoglobinopathy screening and genetic testing results">
	<TextArea label="Hemoglobin Electrophoresis" name="hemoglobinElectrophoresis" bind:value={d.hemoglobinElectrophoresis} placeholder="e.g. HbA 97%, HbA2 2.5%, HbF 0.5%" />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput label="Sickle Cell Screen" name="sickleCellScreen" bind:value={d.sickleCellScreen} options={screenOptions} />
		<SelectInput label="Thalassemia Screen" name="thalassemiaScreen" bind:value={d.thalassemiaScreen} options={screenOptions} />
	</div>

	<TextArea label="HPLC Results" name="hplcResults" rows={2} bind:value={d.hplcResults} placeholder="e.g. Normal pattern, no variant hemoglobins detected" />
	<TextArea label="Genetic Testing Notes" name="geneticTestingNotes" rows={2} bind:value={d.geneticTestingNotes} placeholder="Any relevant genetic testing findings" />
</SectionCard>
