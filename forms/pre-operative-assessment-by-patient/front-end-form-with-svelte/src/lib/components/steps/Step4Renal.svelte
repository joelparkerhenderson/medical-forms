<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const r = assessment.data.renal;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Renal" description="Kidney conditions">
	<RadioGroup label="Do you have chronic kidney disease?" name="ckd" options={yesNo} bind:value={r.ckd} />
	{#if r.ckd === 'yes'}
		<SelectInput
			label="CKD Stage"
			name="ckdStage"
			options={[
				{ value: '1', label: 'Stage 1' },
				{ value: '2', label: 'Stage 2' },
				{ value: '3', label: 'Stage 3' },
				{ value: '4', label: 'Stage 4' },
				{ value: '5', label: 'Stage 5' }
			]}
			bind:value={r.ckdStage}
			required
		/>
	{/if}

	<RadioGroup label="Are you on dialysis?" name="dialysis" options={yesNo} bind:value={r.dialysis} />
	{#if r.dialysis === 'yes'}
		<SelectInput
			label="Dialysis Type"
			name="dialysisType"
			options={[
				{ value: 'haemodialysis', label: 'Haemodialysis' },
				{ value: 'peritoneal', label: 'Peritoneal dialysis' }
			]}
			bind:value={r.dialysisType}
			required
		/>
	{/if}
</SectionCard>
