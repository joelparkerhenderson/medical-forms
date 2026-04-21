<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.medicalConditions;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical Conditions" description="Existing diagnoses and medications relevant to cardiovascular risk">
	<SelectInput
		label="Diabetes"
		name="hasDiabetes"
		bind:value={d.hasDiabetes}
		options={[
			{ value: 'no', label: 'No diabetes' },
			{ value: 'type1', label: 'Type 1 diabetes' },
			{ value: 'type2', label: 'Type 2 diabetes' }
		]}
	/>
	<RadioGroup label="Atrial fibrillation?" name="hasAtrialFibrillation" bind:value={d.hasAtrialFibrillation} options={yesNoOptions} />
	<RadioGroup label="Rheumatoid arthritis?" name="hasRheumatoidArthritis" bind:value={d.hasRheumatoidArthritis} options={yesNoOptions} />
	<RadioGroup label="Chronic kidney disease (stage 3+)?" name="hasChronicKidneyDisease" bind:value={d.hasChronicKidneyDisease} options={yesNoOptions} />
	<RadioGroup label="Migraine?" name="hasMigraine" bind:value={d.hasMigraine} options={yesNoOptions} />
	<RadioGroup label="Severe mental illness?" name="hasSevereMentalIllness" bind:value={d.hasSevereMentalIllness} options={yesNoOptions} />
	{#if assessment.data.demographicsEthnicity.sex === 'male'}
		<RadioGroup label="Erectile dysfunction?" name="hasErectileDysfunction" bind:value={d.hasErectileDysfunction} options={yesNoOptions} />
	{/if}
	<RadioGroup label="On atypical antipsychotic?" name="onAtypicalAntipsychotic" bind:value={d.onAtypicalAntipsychotic} options={yesNoOptions} />
	<RadioGroup label="On regular corticosteroids?" name="onCorticosteroids" bind:value={d.onCorticosteroids} options={yesNoOptions} />
</SectionCard>
