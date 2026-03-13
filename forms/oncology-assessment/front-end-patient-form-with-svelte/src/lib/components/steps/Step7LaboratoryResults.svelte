<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const lab = assessment.data.laboratoryResults;
</script>

<SectionCard title="Laboratory Results" description="Most recent blood work and tumour markers">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Complete Blood Count</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="WBC" name="wbc" bind:value={lab.wbc} unit="x10^9/L" min={0} max={100} step={0.1} />
		<NumberInput label="Haemoglobin" name="haemoglobin" bind:value={lab.haemoglobin} unit="g/L" min={0} max={250} step={1} />
		<NumberInput label="Platelets" name="platelets" bind:value={lab.platelets} unit="x10^9/L" min={0} max={1000} step={1} />
		<NumberInput label="Neutrophils (ANC)" name="neutrophils" bind:value={lab.neutrophils} unit="x10^9/L" min={0} max={50} step={0.1} />
	</div>

	<h3 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Metabolic Panel</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Creatinine" name="creatinine" bind:value={lab.creatinine} unit="umol/L" min={0} max={1500} step={1} />
		<NumberInput label="ALT" name="alt" bind:value={lab.alt} unit="U/L" min={0} max={5000} step={1} />
		<NumberInput label="AST" name="ast" bind:value={lab.ast} unit="U/L" min={0} max={5000} step={1} />
		<NumberInput label="Bilirubin" name="bilirubin" bind:value={lab.bilirubin} unit="umol/L" min={0} max={500} step={1} />
		<NumberInput label="Albumin" name="albumin" bind:value={lab.albumin} unit="g/L" min={0} max={60} step={1} />
		<NumberInput label="Calcium" name="calcium" bind:value={lab.calcium} unit="mmol/L" min={0} max={5} step={0.01} />
	</div>

	<h3 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Other</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="LDH" name="ldh" bind:value={lab.ldh} unit="U/L" min={0} max={5000} step={1} />
		<NumberInput label="INR" name="inr" bind:value={lab.inr} min={0} max={10} step={0.1} />
	</div>

	<h3 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Tumour Markers</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Tumour Marker" name="tumourMarker" bind:value={lab.tumourMarker} placeholder="e.g., CA-125, PSA, CEA" />
		<TextInput label="Value" name="tumourMarkerValue" bind:value={lab.tumourMarkerValue} placeholder="e.g., 45 U/mL" />
	</div>
</SectionCard>
