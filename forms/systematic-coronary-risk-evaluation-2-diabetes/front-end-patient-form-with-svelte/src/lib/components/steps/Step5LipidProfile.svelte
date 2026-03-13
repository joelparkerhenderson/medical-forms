<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { LipidProfile } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: LipidProfile } = $props();

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Lipid Profile">
	<p class="mb-4 text-sm text-gray-500">Enter the most recent fasting lipid profile results.</p>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TextInput label="Total Cholesterol (mmol/L)" id="totalCholesterol" type="number" bind:value={data.totalCholesterol} min={0} max={20} step={0.01} />
		<TextInput label="HDL Cholesterol (mmol/L)" id="hdlCholesterol" type="number" bind:value={data.hdlCholesterol} min={0} max={10} step={0.01} />
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TextInput label="LDL Cholesterol (mmol/L)" id="ldlCholesterol" type="number" bind:value={data.ldlCholesterol} min={0} max={15} step={0.01} />
		<TextInput label="Triglycerides (mmol/L)" id="triglycerides" type="number" bind:value={data.triglycerides} min={0} max={30} step={0.01} />
	</div>

	<TextInput
		label="Non-HDL Cholesterol (mmol/L)"
		id="nonHdlCholesterol"
		type="number"
		bind:value={data.nonHdlCholesterol}
		min={0}
		max={20}
		step={0.01}
		hint="Calculated as Total Cholesterol minus HDL Cholesterol"
	/>

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Lipid-Lowering Therapy</h4>

	<RadioGroup label="On Statin Therapy" name="onStatin" options={yesNo} bind:value={data.onStatin} />

	{#if data.onStatin === 'yes'}
		<TextInput
			label="Statin Name and Dose"
			id="statinName"
			bind:value={data.statinName}
			placeholder="e.g. Atorvastatin 40mg"
		/>
	{/if}

	<RadioGroup
		label="On Other Lipid-Lowering Therapy"
		name="onOtherLipidTherapy"
		options={yesNo}
		bind:value={data.onOtherLipidTherapy}
		hint="e.g. Ezetimibe, PCSK9 inhibitor, fibrate"
	/>
</SectionCard>
