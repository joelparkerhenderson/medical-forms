<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.spirometry;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	$effect(() => {
		if (s.fev1 !== null && s.fvc !== null && s.fvc > 0) {
			assessment.data.spirometry.fev1FvcRatio = Math.round((s.fev1 / s.fvc) * 100) / 100;
		}
	});
</script>

<SectionCard title="Spirometry Results" description="Lung function test measurements">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="FEV1" name="fev1" bind:value={s.fev1} unit="litres" min={0} max={10} step={0.01} />
		<NumberInput label="FVC" name="fvc" bind:value={s.fvc} unit="litres" min={0} max={10} step={0.01} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<span class="mb-1 block text-sm font-medium text-gray-700">FEV1/FVC Ratio</span>
			<div class="flex h-[38px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm">
				{#if s.fev1FvcRatio !== null}
					<span class="font-medium">{s.fev1FvcRatio}</span>
					{#if s.fev1FvcRatio < 0.7}
						<span class="ml-2 text-red-600">(Obstructive pattern)</span>
					{:else}
						<span class="ml-2 text-green-600">(Normal)</span>
					{/if}
				{:else}
					<span class="text-gray-400">Auto-calculated from FEV1/FVC</span>
				{/if}
			</div>
		</div>
		<NumberInput label="FEV1 % Predicted" name="fev1Pct" bind:value={s.fev1PercentPredicted} unit="%" min={0} max={150} />
	</div>

	<RadioGroup label="Significant bronchodilator response?" name="bdr" options={yesNo} bind:value={s.bronchodilatorResponse} />
</SectionCard>
