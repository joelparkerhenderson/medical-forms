<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const r = assessment.data.radiographicFindings;
</script>

<SectionCard title="Radiographic Findings" description="X-ray and imaging results">
	<TextArea
		label="Panoramic (OPG) findings"
		name="panoramicFindings"
		bind:value={r.panoramicFindings}
		placeholder="e.g. No significant findings; or describe pathology"
	/>

	<TextArea
		label="Periapical radiograph findings"
		name="periapicalFindings"
		bind:value={r.periapicalFindings}
		placeholder="e.g. Periapical radiolucency at 46; widened PDL space at 36"
	/>

	<TextArea
		label="Bitewing radiograph findings"
		name="bitewingFindings"
		bind:value={r.bitewingFindings}
		placeholder="e.g. Interproximal caries at 15 mesial; overhanging restoration at 26 distal"
	/>

	<SelectInput
		label="Bone loss pattern"
		name="boneLossPattern"
		options={[
			{ value: 'none', label: 'No bone loss' },
			{ value: 'horizontal', label: 'Horizontal bone loss' },
			{ value: 'vertical', label: 'Vertical (angular) bone loss' },
			{ value: 'combined', label: 'Combined pattern' }
		]}
		bind:value={r.boneLossPattern}
	/>

	{#if r.boneLossPattern !== 'none' && r.boneLossPattern !== ''}
		<TextInput label="Bone loss details" name="boneLossDetails" bind:value={r.boneLossDetails} placeholder="e.g. Generalised horizontal bone loss, 30% in molar regions" />
	{/if}
</SectionCard>
