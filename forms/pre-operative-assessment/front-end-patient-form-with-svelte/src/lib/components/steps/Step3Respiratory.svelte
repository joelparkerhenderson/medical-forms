<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const r = assessment.data.respiratory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Respiratory" description="Lung and breathing conditions">
	<RadioGroup label="Do you have asthma?" name="asthma" options={yesNo} bind:value={r.asthma} />
	{#if r.asthma === 'yes'}
		<SelectInput
			label="How frequent are your symptoms?"
			name="asthmaFreq"
			options={[
				{ value: 'intermittent', label: 'Intermittent' },
				{ value: 'mild-persistent', label: 'Mild persistent' },
				{ value: 'moderate-persistent', label: 'Moderate persistent' },
				{ value: 'severe-persistent', label: 'Severe persistent' }
			]}
			bind:value={r.asthmaFrequency}
			required
		/>
	{/if}

	<RadioGroup label="Do you have COPD (chronic bronchitis / emphysema)?" name="copd" options={yesNo} bind:value={r.copd} />
	{#if r.copd === 'yes'}
		<SelectInput
			label="COPD Severity"
			name="copdSev"
			options={[
				{ value: 'mild', label: 'Mild' },
				{ value: 'moderate', label: 'Moderate' },
				{ value: 'severe', label: 'Severe' }
			]}
			bind:value={r.copdSeverity}
			required
		/>
	{/if}

	<RadioGroup label="Do you have obstructive sleep apnoea (OSA)?" name="osa" options={yesNo} bind:value={r.osa} />
	{#if r.osa === 'yes'}
		<RadioGroup label="Do you use a CPAP machine?" name="cpap" options={yesNo} bind:value={r.osaCPAP} />
	{/if}

	<RadioGroup
		label="Do you smoke?"
		name="smoking"
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
		bind:value={r.smoking}
	/>
	{#if r.smoking === 'current' || r.smoking === 'ex'}
		<NumberInput label="Pack-years" name="packYears" bind:value={r.smokingPackYears} min={0} max={200} />
	{/if}

	<RadioGroup label="Have you had a recent upper respiratory tract infection (cold/flu)?" name="urti" options={yesNo} bind:value={r.recentURTI} />
</SectionCard>
