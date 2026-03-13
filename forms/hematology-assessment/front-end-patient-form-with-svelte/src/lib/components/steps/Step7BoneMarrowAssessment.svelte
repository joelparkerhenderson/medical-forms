<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.boneMarrowAssessment;
</script>

<SectionCard title="Bone Marrow Assessment" description="Enter bone marrow aspirate and biopsy findings if applicable">
	<TextArea label="Aspirate Findings" name="aspirateFindings" bind:value={d.aspirateFindings} placeholder="e.g. Adequate cellularity, trilineage hematopoiesis present" />
	<TextArea label="Biopsy Findings" name="biopsyFindings" bind:value={d.biopsyFindings} placeholder="e.g. Normocellular marrow for age, no fibrosis" />

	<SelectInput
		label="Cellularity Rating (1-5)"
		name="cellularity"
		bind:value={d.cellularity as unknown as string}
		options={[
			{ value: '1', label: '1 - Markedly Hypocellular' },
			{ value: '2', label: '2 - Hypocellular' },
			{ value: '3', label: '3 - Normocellular' },
			{ value: '4', label: '4 - Hypercellular' },
			{ value: '5', label: '5 - Markedly Hypercellular' }
		]}
	/>

	<TextArea label="Cytogenetics Results" name="cytogeneticsResults" rows={2} bind:value={d.cytogeneticsResults} placeholder="e.g. Normal karyotype 46,XX or 46,XY" />
	<TextArea label="Flow Cytometry Results" name="flowCytometryResults" rows={2} bind:value={d.flowCytometryResults} placeholder="e.g. No aberrant immunophenotype detected" />
	<TextArea label="Additional Comments" name="boneMarrowComments" rows={2} bind:value={d.boneMarrowComments} placeholder="Any additional bone marrow findings" />
</SectionCard>
