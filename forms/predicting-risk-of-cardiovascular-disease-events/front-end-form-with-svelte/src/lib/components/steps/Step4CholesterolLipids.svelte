<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const cl = assessment.data.cholesterolLipids;
</script>

<SectionCard title="Cholesterol & Lipids" description="Lipid panel values and statin treatment status">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Total Cholesterol" name="totalCholesterol" bind:value={cl.totalCholesterol} min={50} max={500} step={1} unit="mg/dL" />
		<NumberInput label="HDL Cholesterol" name="hdlCholesterol" bind:value={cl.hdlCholesterol} min={10} max={200} step={1} unit="mg/dL" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="LDL Cholesterol" name="ldlCholesterol" bind:value={cl.ldlCholesterol} min={10} max={400} step={1} unit="mg/dL" />
		<NumberInput label="Triglycerides" name="triglycerides" bind:value={cl.triglycerides} min={10} max={1000} step={1} unit="mg/dL" />
	</div>

	<NumberInput label="Non-HDL Cholesterol" name="nonHdlCholesterol" bind:value={cl.nonHdlCholesterol} min={10} max={500} step={1} unit="mg/dL" />

	<RadioGroup
		label="On statin therapy?"
		name="onStatin"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={cl.onStatin}
	/>

	{#if cl.onStatin === 'yes'}
		<TextInput label="Statin Name" name="statinName" bind:value={cl.statinName} placeholder="e.g. Atorvastatin 20mg" />
	{/if}
</SectionCard>
