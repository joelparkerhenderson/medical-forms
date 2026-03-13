<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.peripheralBloodFilm;
</script>

<SectionCard title="Peripheral Blood Film" description="Describe findings from the peripheral blood smear examination">
	<TextArea label="Red Cell Morphology" name="redCellMorphology" bind:value={d.redCellMorphology} placeholder="e.g. Normochromic normocytic, microcytic hypochromic, target cells present" />
	<TextArea label="White Blood Cell Differential" name="whiteBloodCellDifferential" bind:value={d.whiteBloodCellDifferential} placeholder="e.g. Neutrophils 60%, Lymphocytes 30%, Monocytes 5%, Eosinophils 3%, Basophils 2%" />
	<TextArea label="Platelet Morphology" name="plateletMorphology" rows={2} bind:value={d.plateletMorphology} placeholder="e.g. Adequate number, normal morphology" />
	<TextArea label="Abnormal Cell Morphology" name="abnormalCellMorphology" bind:value={d.abnormalCellMorphology} placeholder="e.g. Blast cells, atypical lymphocytes, schistocytes" />

	<SelectInput
		label="Film Quality (1-5)"
		name="filmQuality"
		bind:value={d.filmQuality as unknown as string}
		options={[
			{ value: '1', label: '1 - Poor' },
			{ value: '2', label: '2 - Below Average' },
			{ value: '3', label: '3 - Adequate' },
			{ value: '4', label: '4 - Good' },
			{ value: '5', label: '5 - Excellent' }
		]}
	/>

	<TextArea label="Additional Film Comments" name="filmComments" rows={2} bind:value={d.filmComments} placeholder="Any additional observations" />
</SectionCard>
