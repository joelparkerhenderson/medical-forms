<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const h = assessment.data.hepatic;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Hepatic" description="Liver conditions">
	<RadioGroup label="Do you have liver disease?" name="liver" options={yesNo} bind:value={h.liverDisease} />
	{#if h.liverDisease === 'yes'}
		<RadioGroup label="Do you have cirrhosis?" name="cirrhosis" options={yesNo} bind:value={h.cirrhosis} />
		{#if h.cirrhosis === 'yes'}
			<SelectInput
				label="Child-Pugh Score"
				name="childPugh"
				options={[
					{ value: 'A', label: 'A - Well compensated' },
					{ value: 'B', label: 'B - Significant compromise' },
					{ value: 'C', label: 'C - Decompensated' }
				]}
				bind:value={h.childPughScore}
				required
			/>
		{/if}
	{/if}

	<RadioGroup label="Do you have hepatitis?" name="hepatitis" options={yesNo} bind:value={h.hepatitis} />
	{#if h.hepatitis === 'yes'}
		<TextInput label="Type (e.g. A, B, C)" name="hepType" bind:value={h.hepatitisType} />
	{/if}
</SectionCard>
