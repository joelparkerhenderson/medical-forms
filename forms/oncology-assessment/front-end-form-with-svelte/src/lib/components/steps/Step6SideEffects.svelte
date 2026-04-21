<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const se = assessment.data.sideEffects;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const ctcaeOptions = [
		{ value: '0', label: 'Grade 0 - None' },
		{ value: '1', label: 'Grade 1 - Mild' },
		{ value: '2', label: 'Grade 2 - Moderate' },
		{ value: '3', label: 'Grade 3 - Severe' },
		{ value: '4', label: 'Grade 4 - Life-threatening' }
	];
</script>

<SectionCard title="Side Effects" description="Treatment-related adverse effects (CTCAE grading)">
	<SelectInput label="Neuropathy (CTCAE Grade)" name="neuropathy" options={ctcaeOptions} bind:value={se.neuropathy} />
	{#if se.neuropathy === '2' || se.neuropathy === '3' || se.neuropathy === '4'}
		<TextArea label="Neuropathy details" name="neuropathyDetails" bind:value={se.neuropathyDetails} placeholder="Distribution, functional impact" />
	{/if}

	<SelectInput label="Mucositis (CTCAE Grade)" name="mucositis" options={ctcaeOptions} bind:value={se.mucositis} />

	<SelectInput label="Skin Reactions (CTCAE Grade)" name="skinReactions" options={ctcaeOptions} bind:value={se.skinReactions} />
	{#if se.skinReactions === '2' || se.skinReactions === '3' || se.skinReactions === '4'}
		<TextArea label="Skin reaction details" name="skinReactionDetails" bind:value={se.skinReactionDetails} placeholder="Type, location, management" />
	{/if}

	<h3 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Myelosuppression</h3>
	<RadioGroup label="Myelosuppression present?" name="myelosuppression" options={yesNo} bind:value={se.myelosuppression} />
	{#if se.myelosuppression === 'yes'}
		<RadioGroup label="Neutropenia?" name="neutropenia" options={yesNo} bind:value={se.neutropenia} />
		<RadioGroup label="Thrombocytopenia?" name="thrombocytopenia" options={yesNo} bind:value={se.thrombocytopenia} />
		<RadioGroup label="Anaemia?" name="anaemia" options={yesNo} bind:value={se.anaemia} />
	{/if}

	<SelectInput label="Organ Toxicity (CTCAE Grade)" name="organToxicity" options={ctcaeOptions} bind:value={se.organToxicityGrade} />
	{#if se.organToxicityGrade === '2' || se.organToxicityGrade === '3' || se.organToxicityGrade === '4'}
		<TextArea label="Organ toxicity details" name="organToxicityDetails" bind:value={se.organToxicityDetails} placeholder="Organ affected, details" />
	{/if}
</SectionCard>
