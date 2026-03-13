<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.laboratoryResults;

	const yesNoOptions = [
		{ value: 'yes', label: 'Positive' },
		{ value: 'no', label: 'Negative' }
	];
</script>

<SectionCard title="Laboratory Results" description="Recent blood test results and serological markers">
	<h3 class="mb-3 font-semibold text-gray-800">Inflammatory Markers</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="ESR" name="esr" bind:value={d.esr} unit="mm/hr" min={0} max={200} required />
		<NumberInput label="CRP" name="crp" bind:value={d.crp} unit="mg/L" min={0} max={500} step={0.1} />
	</div>

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Serological Markers</h3>
	<RadioGroup label="Rheumatoid Factor (RF)" name="rheumatoidFactor" options={yesNoOptions} bind:value={d.rheumatoidFactor} />
	<RadioGroup label="Anti-CCP Antibodies" name="antiCCP" options={yesNoOptions} bind:value={d.antiCCP} />
	<RadioGroup label="ANA" name="ana" options={yesNoOptions} bind:value={d.ana} />
	<RadioGroup label="HLA-B27" name="hlaB27" options={yesNoOptions} bind:value={d.hlaB27} />

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Complete Blood Count</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
		<NumberInput label="Haemoglobin" name="haemoglobin" bind:value={d.haemoglobin} unit="g/L" min={0} max={250} />
		<NumberInput label="White Blood Cells" name="wbc" bind:value={d.whiteBloodCellCount} unit="x10^9/L" min={0} max={100} step={0.1} />
		<NumberInput label="Platelets" name="platelets" bind:value={d.plateletCount} unit="x10^9/L" min={0} max={1000} />
	</div>

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Renal &amp; Liver Function</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Creatinine" name="creatinine" bind:value={d.creatinine} unit="umol/L" min={0} max={2000} />
		<NumberInput label="eGFR" name="egfr" bind:value={d.egfr} unit="mL/min" min={0} max={150} />
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="ALT" name="alt" bind:value={d.alt} unit="U/L" min={0} max={2000} />
		<NumberInput label="AST" name="ast" bind:value={d.ast} unit="U/L" min={0} max={2000} />
	</div>
</SectionCard>
