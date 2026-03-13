<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const r = assessment.data.renalFunction;
</script>

<SectionCard title="Renal Function" description="Laboratory results and prostate-specific antigen levels">
	<NumberInput
		label="Creatinine"
		name="creatinine"
		bind:value={r.creatinine}
		unit="umol/L"
		min={0}
		max={2000}
		step={1}
	/>

	<NumberInput
		label="eGFR (Estimated Glomerular Filtration Rate)"
		name="eGFR"
		bind:value={r.eGFR}
		unit="mL/min/1.73m2"
		min={0}
		max={200}
		step={1}
	/>

	<TextArea
		label="Urinalysis results"
		name="urinalysis"
		bind:value={r.urinalysis}
		placeholder="Enter urinalysis findings if available..."
	/>

	<NumberInput
		label="PSA (Prostate-Specific Antigen)"
		name="psa"
		bind:value={r.psa}
		unit="ng/mL"
		min={0}
		max={1000}
		step={0.1}
	/>

	<TextInput
		label="Date of PSA test"
		name="psaDate"
		type="date"
		bind:value={r.psaDate}
	/>
</SectionCard>
