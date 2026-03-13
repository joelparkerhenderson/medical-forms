<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.systemicConditions;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Systemic Conditions" description="General health conditions relevant to eye health">
	<RadioGroup label="Do you have diabetes?" name="diabetes" options={yesNo} bind:value={s.diabetes} />
	{#if s.diabetes === 'yes'}
		<SelectInput
			label="Diabetes type"
			name="diabetesType"
			options={[
				{ value: 'type1', label: 'Type 1' },
				{ value: 'type2', label: 'Type 2' }
			]}
			bind:value={s.diabetesType}
		/>
		<SelectInput
			label="Diabetes control"
			name="diabetesControl"
			options={[
				{ value: 'well-controlled', label: 'Well controlled' },
				{ value: 'poorly-controlled', label: 'Poorly controlled' }
			]}
			bind:value={s.diabetesControl}
		/>
		<RadioGroup label="Has diabetic retinopathy been diagnosed?" name="dr" options={yesNo} bind:value={s.diabeticRetinopathy} />
		{#if s.diabeticRetinopathy === 'yes'}
			<SelectInput
				label="Retinopathy stage"
				name="drStage"
				options={[
					{ value: 'background', label: 'Background (non-proliferative)' },
					{ value: 'pre-proliferative', label: 'Pre-proliferative' },
					{ value: 'proliferative', label: 'Proliferative' },
					{ value: 'maculopathy', label: 'Diabetic maculopathy' }
				]}
				bind:value={s.diabeticRetinopathyStage}
			/>
		{/if}
	{/if}

	<RadioGroup label="Do you have high blood pressure (hypertension)?" name="htn" options={yesNo} bind:value={s.hypertension} />
	{#if s.hypertension === 'yes'}
		<RadioGroup label="Is it well controlled?" name="htnCtrl" options={yesNo} bind:value={s.hypertensionControlled} />
	{/if}

	<RadioGroup label="Do you have any autoimmune conditions?" name="autoimmune" options={yesNo} bind:value={s.autoimmune} />
	{#if s.autoimmune === 'yes'}
		<TextArea label="Please provide details (e.g. rheumatoid arthritis, lupus, sarcoidosis)" name="autoimmuneDetails" bind:value={s.autoimmuneDetails} />
	{/if}

	<RadioGroup label="Do you have thyroid eye disease?" name="ted" options={yesNo} bind:value={s.thyroidEyeDisease} />
	{#if s.thyroidEyeDisease === 'yes'}
		<TextArea label="Thyroid eye disease details" name="tedDetails" bind:value={s.thyroidEyeDiseaseDetails} />
	{/if}

	<RadioGroup label="Do you have any neurological conditions?" name="neuro" options={yesNo} bind:value={s.neurological} />
	{#if s.neurological === 'yes'}
		<TextArea label="Neurological condition details (e.g. MS, myasthenia gravis)" name="neuroDetails" bind:value={s.neurologicalDetails} />
	{/if}
</SectionCard>
