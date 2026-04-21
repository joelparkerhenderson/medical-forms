<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const p = assessment.data.pulmonaryFunction;
</script>

<SectionCard title="Pulmonary Function" description="Spirometry and gas transfer results (if available)">
	<p class="mb-4 text-sm text-gray-500">
		Enter results as percentage of predicted values where applicable. Leave blank if not tested.
	</p>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="FEV1" name="fev1" bind:value={p.fev1} unit="% predicted" min={0} max={150} />
		<NumberInput label="FVC" name="fvc" bind:value={p.fvc} unit="% predicted" min={0} max={150} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="FEV1/FVC Ratio" name="fev1Fvc" bind:value={p.fev1FvcRatio} unit="%" min={0} max={100} />
		<NumberInput label="DLCO (Gas Transfer)" name="dlco" bind:value={p.dlco} unit="% predicted" min={0} max={150} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="TLC (Total Lung Capacity)" name="tlc" bind:value={p.tlc} unit="% predicted" min={0} max={200} />
		<NumberInput label="Oxygen Saturation (SpO2)" name="spo2" bind:value={p.oxygenSaturation} unit="%" min={50} max={100} />
	</div>
</SectionCard>
