<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const h = assessment.data.haematological;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Haematological" description="Blood and clotting conditions">
	<RadioGroup label="Do you have a bleeding disorder?" name="bleeding" options={yesNo} bind:value={h.bleedingDisorder} />
	{#if h.bleedingDisorder === 'yes'}
		<TextInput label="Please provide details" name="bleedDetails" bind:value={h.bleedingDetails} />
	{/if}

	<RadioGroup label="Are you taking blood thinners (anticoagulants/antiplatelets)?" name="anticoag" options={yesNo} bind:value={h.onAnticoagulants} />
	{#if h.onAnticoagulants === 'yes'}
		<TextInput label="Which medication? (e.g. warfarin, rivaroxaban, clopidogrel)" name="anticoagType" bind:value={h.anticoagulantType} />
	{/if}

	<RadioGroup label="Do you have sickle cell disease?" name="sickle" options={yesNo} bind:value={h.sickleCellDisease} />
	{#if h.sickleCellDisease !== 'yes'}
		<RadioGroup label="Do you carry the sickle cell trait?" name="sickleTrait" options={yesNo} bind:value={h.sickleCellTrait} />
	{/if}

	<RadioGroup label="Do you have anaemia?" name="anaemia" options={yesNo} bind:value={h.anaemia} />
</SectionCard>
