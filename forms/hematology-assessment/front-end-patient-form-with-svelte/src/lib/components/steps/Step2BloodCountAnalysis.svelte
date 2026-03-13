<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const d = assessment.data.bloodCountAnalysis;
</script>

<SectionCard title="Blood Count Analysis" description="Enter complete blood count (CBC) results">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Hemoglobin" name="hemoglobin" unit="g/dL" step={0.1} bind:value={d.hemoglobin} placeholder="Normal: 12.0-17.0" />
		<NumberInput label="Hematocrit" name="hematocrit" unit="%" step={0.1} bind:value={d.hematocrit} placeholder="Normal: 36-52" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Red Blood Cell Count" name="redBloodCellCount" unit="x10^12/L" step={0.01} bind:value={d.redBloodCellCount} placeholder="Normal: 4.0-6.0" />
		<NumberInput label="White Blood Cell Count" name="whiteBloodCellCount" unit="x10^9/L" step={0.1} bind:value={d.whiteBloodCellCount} placeholder="Normal: 4.0-11.0" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Platelet Count" name="plateletCount" unit="x10^9/L" step={1} bind:value={d.plateletCount} placeholder="Normal: 150-400" />
		<NumberInput label="Mean Corpuscular Volume" name="meanCorpuscularVolume" unit="fL" step={0.1} bind:value={d.meanCorpuscularVolume} placeholder="Normal: 80-100" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Mean Corpuscular Hemoglobin" name="meanCorpuscularHemoglobin" unit="pg" step={0.1} bind:value={d.meanCorpuscularHemoglobin} placeholder="Normal: 27-33" />
		<NumberInput label="Red Cell Distribution Width" name="redCellDistributionWidth" unit="%" step={0.1} bind:value={d.redCellDistributionWidth} placeholder="Normal: 11.5-14.5" />
	</div>
</SectionCard>
