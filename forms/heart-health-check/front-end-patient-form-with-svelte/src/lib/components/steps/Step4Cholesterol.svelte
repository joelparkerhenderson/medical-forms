<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import { calculateTcHdlRatio } from '$lib/engine/utils';

	const d = assessment.data.cholesterol;

	const autoRatio = $derived(
		d.totalHDLRatio ?? calculateTcHdlRatio(d.totalCholesterol, d.hdlCholesterol)
	);
</script>

<SectionCard title="Cholesterol" description="Lipid profile and statin status">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Total Cholesterol" name="totalCholesterol" bind:value={d.totalCholesterol} min={1} max={15} step={0.1} unit="mmol/L" />
		<NumberInput label="HDL Cholesterol" name="hdlCholesterol" bind:value={d.hdlCholesterol} min={0.2} max={5} step={0.1} unit="mmol/L" />
	</div>
	{#if autoRatio != null}
		<div class="mb-4 rounded-lg bg-blue-50 p-3 text-sm">
			<span class="font-medium text-blue-800">TC/HDL Ratio:</span>
			<span class="text-blue-700">{autoRatio}</span>
		</div>
	{/if}
	<NumberInput label="TC/HDL Ratio (override)" name="totalHDLRatio" bind:value={d.totalHDLRatio} min={1} max={20} step={0.1} />
	<RadioGroup
		label="Currently on statin?"
		name="onStatin"
		bind:value={d.onStatin}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>
</SectionCard>
