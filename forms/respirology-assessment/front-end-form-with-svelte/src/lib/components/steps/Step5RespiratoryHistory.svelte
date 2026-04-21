<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const r = assessment.data.respiratoryHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Respiratory History" description="Previous respiratory conditions and diagnoses">
	<RadioGroup label="Do you have asthma?" name="asthma" options={yesNo} bind:value={r.asthma} />

	<RadioGroup label="Do you have COPD?" name="copd" options={yesNo} bind:value={r.copd} />
	{#if r.copd === 'yes'}
		<SelectInput
			label="COPD Severity"
			name="copdSeverity"
			options={[
				{ value: 'mild', label: 'Mild' },
				{ value: 'moderate', label: 'Moderate' },
				{ value: 'severe', label: 'Severe' }
			]}
			bind:value={r.copdSeverity}
			required
		/>
	{/if}

	<RadioGroup label="Do you have bronchiectasis?" name="bronchiectasis" options={yesNo} bind:value={r.bronchiectasis} />

	<RadioGroup label="Do you have interstitial lung disease (ILD)?" name="ild" options={yesNo} bind:value={r.interstitialLungDisease} />
	{#if r.interstitialLungDisease === 'yes'}
		<TextInput label="Type of ILD" name="ildType" bind:value={r.ildType} placeholder="e.g. IPF, sarcoidosis, hypersensitivity pneumonitis..." />
	{/if}

	<RadioGroup label="Have you had tuberculosis (TB)?" name="tb" options={yesNo} bind:value={r.tuberculosis} />
	{#if r.tuberculosis === 'yes'}
		<RadioGroup label="Was TB treatment completed?" name="tbComplete" options={yesNo} bind:value={r.tbTreatmentComplete} />
	{/if}

	<RadioGroup label="Have you had pneumonia?" name="pneumonia" options={yesNo} bind:value={r.pneumonia} />
	{#if r.pneumonia === 'yes'}
		<RadioGroup label="Has pneumonia been recurrent?" name="pneumoniaRecurrent" options={yesNo} bind:value={r.pneumoniaRecurrent} />
	{/if}

	<RadioGroup label="Have you had a pulmonary embolism (PE)?" name="pe" options={yesNo} bind:value={r.pulmonaryEmbolism} />
	{#if r.pulmonaryEmbolism === 'yes'}
		<TextInput label="Date of PE" name="peDate" type="date" bind:value={r.peDate} />
	{/if}
</SectionCard>
