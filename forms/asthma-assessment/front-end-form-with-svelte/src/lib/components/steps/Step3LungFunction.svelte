<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculatePeakFlowPercent, fev1Severity } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const lf = assessment.data.lungFunction;

	$effect(() => {
		const pct = calculatePeakFlowPercent(lf.peakFlowCurrent, lf.peakFlowBest);
		assessment.data.lungFunction.peakFlowPercent = pct;
	});
</script>

<SectionCard title="Lung Function" description="Spirometry and peak flow measurements">
	<NumberInput
		label="FEV1 (% predicted)"
		name="fev1Percent"
		bind:value={lf.fev1Percent}
		min={0}
		max={150}
		unit="%"
	/>
	{#if lf.fev1Percent !== null}
		<p class="mb-4 -mt-2 text-sm text-gray-500">
			Classification: {fev1Severity(lf.fev1Percent)}
		</p>
	{/if}

	<NumberInput
		label="FEV1/FVC Ratio"
		name="fev1Fvc"
		bind:value={lf.fev1Fvc}
		min={0}
		max={1}
		step={0.01}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
		<NumberInput
			label="Peak Flow - Personal Best"
			name="peakFlowBest"
			bind:value={lf.peakFlowBest}
			min={0}
			max={900}
			unit="L/min"
		/>
		<NumberInput
			label="Peak Flow - Current"
			name="peakFlowCurrent"
			bind:value={lf.peakFlowCurrent}
			min={0}
			max={900}
			unit="L/min"
		/>
		<div class="mb-4">
			<span class="mb-1 block text-sm font-medium text-gray-700">Peak Flow %</span>
			<div class="flex h-[38px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm">
				{#if lf.peakFlowPercent !== null}
					<span class="font-medium">{lf.peakFlowPercent}%</span>
					<span class="ml-2 text-gray-500">of personal best</span>
				{:else}
					<span class="text-gray-400">Auto-calculated</span>
				{/if}
			</div>
		</div>
	</div>

	<TextInput
		label="Last Spirometry Date"
		name="spirometryDate"
		type="date"
		bind:value={lf.spirometryDate}
	/>

	<TextArea
		label="Spirometry Notes"
		name="spirometryNotes"
		bind:value={lf.spirometryNotes}
		placeholder="Any additional notes about spirometry results..."
	/>
</SectionCard>
