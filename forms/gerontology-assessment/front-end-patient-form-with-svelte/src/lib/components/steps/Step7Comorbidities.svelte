<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const c = assessment.data.comorbidities;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Comorbidities" description="Cardiovascular, diabetes, renal, respiratory, musculoskeletal, and sensory conditions">
	<RadioGroup label="Do you have any cardiovascular disease (heart disease, hypertension, heart failure)?" name="cardiovascularDisease" options={yesNo} bind:value={c.cardiovascularDisease} />
	{#if c.cardiovascularDisease === 'yes'}
		<TextInput label="Cardiovascular details" name="cardiovascularDetails" bind:value={c.cardiovascularDetails} placeholder="e.g., hypertension, atrial fibrillation, heart failure" />
	{/if}

	<RadioGroup label="Do you have diabetes?" name="diabetes" options={yesNo} bind:value={c.diabetes} />
	{#if c.diabetes === 'yes'}
		<SelectInput
			label="Diabetes control"
			name="diabetesControl"
			options={[
				{ value: 'well-controlled', label: 'Well controlled' },
				{ value: 'poorly-controlled', label: 'Poorly controlled' }
			]}
			bind:value={c.diabetesControl}
			required
		/>
	{/if}

	<RadioGroup label="Do you have any kidney disease?" name="renalDisease" options={yesNo} bind:value={c.renalDisease} />
	{#if c.renalDisease === 'yes'}
		<TextInput label="Kidney disease details" name="renalDetails" bind:value={c.renalDetails} placeholder="e.g., CKD stage, on dialysis" />
	{/if}

	<RadioGroup label="Do you have any respiratory disease (COPD, asthma)?" name="respiratoryDisease" options={yesNo} bind:value={c.respiratoryDisease} />
	{#if c.respiratoryDisease === 'yes'}
		<TextInput label="Respiratory disease details" name="respiratoryDetails" bind:value={c.respiratoryDetails} />
	{/if}

	<RadioGroup label="Do you have any musculoskeletal conditions (arthritis, osteoporosis)?" name="musculoskeletalDisease" options={yesNo} bind:value={c.musculoskeletalDisease} />
	{#if c.musculoskeletalDisease === 'yes'}
		<TextInput label="Musculoskeletal details" name="musculoskeletalDetails" bind:value={c.musculoskeletalDetails} />
	{/if}

	<RadioGroup label="Do you have any visual deficit?" name="visualDeficit" options={yesNo} bind:value={c.visualDeficit} />
	<RadioGroup label="Do you have any hearing deficit?" name="hearingDeficit" options={yesNo} bind:value={c.hearingDeficit} />
</SectionCard>
