<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const rf = assessment.data.renalFunction;
</script>

<SectionCard title="Renal Function" description="Kidney function markers used in PREVENT risk estimation">
	<NumberInput label="eGFR" name="egfr" bind:value={rf.egfr} min={1} max={200} step={1} unit="mL/min/1.73m2" />

	<NumberInput label="Creatinine" name="creatinine" bind:value={rf.creatinine} min={0.1} max={30} step={0.1} unit="mg/dL" />

	<NumberInput label="Urine ACR" name="urineAcr" bind:value={rf.urineAcr} min={0} max={5000} step={1} unit="mg/g" />

	<SelectInput
		label="CKD Stage"
		name="ckdStage"
		options={[
			{ value: '1', label: 'Stage 1 (eGFR >= 90)' },
			{ value: '2', label: 'Stage 2 (eGFR 60-89)' },
			{ value: '3a', label: 'Stage 3a (eGFR 45-59)' },
			{ value: '3b', label: 'Stage 3b (eGFR 30-44)' },
			{ value: '4', label: 'Stage 4 (eGFR 15-29)' },
			{ value: '5', label: 'Stage 5 (eGFR < 15)' }
		]}
		bind:value={rf.ckdStage}
	/>
</SectionCard>
