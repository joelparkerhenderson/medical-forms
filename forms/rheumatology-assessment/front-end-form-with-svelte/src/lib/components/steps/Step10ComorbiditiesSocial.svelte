<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.comorbiditiesSocial;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Comorbidities & Social" description="Other medical conditions, vaccination status, and lifestyle factors">
	<h3 class="mb-3 font-semibold text-gray-800">Comorbidities</h3>

	<RadioGroup label="Cardiovascular Risk" name="cardiovascularRisk" options={yesNoOptions} bind:value={d.cardiovascularRisk} />
	{#if d.cardiovascularRisk === 'yes'}
		<TextArea label="Cardiovascular Risk Details" name="cardiovascularRiskDetails" bind:value={d.cardiovascularRiskDetails} placeholder="Hypertension, hyperlipidaemia, etc..." />
	{/if}

	<RadioGroup label="Osteoporosis" name="osteoporosis" options={yesNoOptions} bind:value={d.osteoporosis} />
	{#if d.osteoporosis === 'yes'}
		<RadioGroup label="On Osteoporosis Treatment" name="osteoporosisOnTreatment" options={yesNoOptions} bind:value={d.osteoporosisOnTreatment} />
	{/if}

	<RadioGroup label="Recent Infections" name="recentInfections" options={yesNoOptions} bind:value={d.recentInfections} />
	{#if d.recentInfections === 'yes'}
		<TextArea label="Infection Details" name="recentInfectionDetails" bind:value={d.recentInfectionDetails} placeholder="Type, treatment, resolution..." />
	{/if}

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Screening & Vaccination</h3>

	<RadioGroup label="TB Screening Performed" name="tuberculosisScreening" options={yesNoOptions} bind:value={d.tuberculosisScreening} />

	<RadioGroup label="Vaccinations Up To Date" name="vaccinationStatusUpToDate" options={yesNoOptions} bind:value={d.vaccinationStatusUpToDate} />
	{#if d.vaccinationStatusUpToDate === 'no'}
		<TextArea label="Vaccination Details" name="vaccinationDetails" bind:value={d.vaccinationDetails} placeholder="Missing vaccinations..." />
	{/if}

	<h3 class="mb-3 mt-6 font-semibold text-gray-800">Social History</h3>

	<RadioGroup
		label="Smoking Status"
		name="smoking"
		options={[
			{ value: 'current', label: 'Current Smoker' },
			{ value: 'ex', label: 'Ex-Smoker' },
			{ value: 'never', label: 'Never Smoked' }
		]}
		bind:value={d.smoking}
	/>

	{#if d.smoking === 'current' || d.smoking === 'ex'}
		<NumberInput label="Pack Years" name="smokingPackYears" bind:value={d.smokingPackYears} min={0} max={200} />
	{/if}

	<SelectInput
		label="Exercise Frequency"
		name="exerciseFrequency"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional' },
			{ value: 'regular', label: 'Regular (2-3x/week)' },
			{ value: 'daily', label: 'Daily' }
		]}
		bind:value={d.exerciseFrequency}
	/>
</SectionCard>
