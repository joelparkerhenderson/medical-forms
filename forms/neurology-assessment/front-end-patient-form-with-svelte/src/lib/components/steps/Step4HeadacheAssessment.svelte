<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const h = assessment.data.headacheAssessment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Headache Assessment" description="Headache type, frequency, and red flag symptoms">
	<RadioGroup label="Do you suffer from headaches?" name="headachePresent" options={yesNo} bind:value={h.headachePresent} />

	{#if h.headachePresent === 'yes'}
		<SelectInput
			label="Headache type"
			name="headacheType"
			options={[
				{ value: 'tension', label: 'Tension-type' },
				{ value: 'migraine', label: 'Migraine' },
				{ value: 'cluster', label: 'Cluster' },
				{ value: 'thunderclap', label: 'Thunderclap' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={h.headacheType}
		/>

		<SelectInput
			label="Frequency"
			name="headacheFrequency"
			options={[
				{ value: 'daily', label: 'Daily' },
				{ value: 'weekly', label: 'Weekly' },
				{ value: 'monthly', label: 'Monthly' },
				{ value: 'occasional', label: 'Occasional' }
			]}
			bind:value={h.frequency}
		/>

		<NumberInput label="Severity (0-10)" name="headacheSeverity" bind:value={h.severity} min={0} max={10} />

		<RadioGroup label="Do you experience aura?" name="aura" options={yesNo} bind:value={h.aura} />
		{#if h.aura === 'yes'}
			<TextArea label="Describe the aura" name="auraDescription" bind:value={h.auraDescription} />
		{/if}

		<TextArea label="Known triggers" name="triggers" bind:value={h.triggers} placeholder="e.g., stress, light, foods, menstruation" />

		<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
			<h3 class="mb-3 font-semibold text-red-800">Red Flag Symptoms</h3>
			<RadioGroup label="Sudden onset (thunderclap)?" name="redFlagSudden" options={yesNo} bind:value={h.redFlagSuddenOnset} />
			<RadioGroup label="Worst headache of your life?" name="redFlagWorst" options={yesNo} bind:value={h.redFlagWorstEver} />
			<RadioGroup label="Associated fever?" name="redFlagFever" options={yesNo} bind:value={h.redFlagFever} />
			<RadioGroup label="Neck stiffness?" name="redFlagNeck" options={yesNo} bind:value={h.redFlagNeckStiffness} />
			<RadioGroup label="Focal neurological deficit?" name="redFlagDeficit" options={yesNo} bind:value={h.redFlagNeurologicalDeficit} />
		</div>
	{/if}
</SectionCard>
