<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const c = assessment.data.chestPainAngina;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Chest Pain / Angina" description="Character, location, radiation, and classification of chest pain">
	<RadioGroup label="Do you experience chest pain?" name="chestPain" options={yesNo} bind:value={c.chestPain} />

	{#if c.chestPain === 'yes'}
		<SelectInput
			label="Pain character"
			name="painCharacter"
			options={[
				{ value: 'crushing', label: 'Crushing / Heavy' },
				{ value: 'pressure', label: 'Pressure / Tightness' },
				{ value: 'sharp', label: 'Sharp / Stabbing' },
				{ value: 'burning', label: 'Burning' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={c.painCharacter}
		/>

		<TextInput label="Pain location" name="painLocation" bind:value={c.painLocation} placeholder="e.g. Central chest, left-sided" />

		<SelectInput
			label="Pain radiation"
			name="painRadiation"
			options={[
				{ value: 'left-arm', label: 'Left arm' },
				{ value: 'jaw', label: 'Jaw' },
				{ value: 'back', label: 'Back' },
				{ value: 'none', label: 'None' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={c.painRadiation}
		/>

		<SelectInput
			label="CCS Angina Class"
			name="ccsClass"
			options={[
				{ value: '1', label: 'Class I - Angina only with strenuous exertion' },
				{ value: '2', label: 'Class II - Slight limitation of ordinary activity' },
				{ value: '3', label: 'Class III - Marked limitation of ordinary activity' },
				{ value: '4', label: 'Class IV - Angina at rest' }
			]}
			bind:value={c.ccsClass}
			required
		/>

		<SelectInput
			label="Angina frequency"
			name="anginaFrequency"
			options={[
				{ value: 'daily', label: 'Daily' },
				{ value: 'weekly', label: 'Weekly' },
				{ value: 'monthly', label: 'Monthly' },
				{ value: 'rarely', label: 'Rarely' }
			]}
			bind:value={c.anginaFrequency}
		/>

		<SelectInput
			label="Angina duration"
			name="anginaDuration"
			options={[
				{ value: 'less-5-min', label: 'Less than 5 minutes' },
				{ value: '5-20-min', label: '5-20 minutes' },
				{ value: 'greater-20-min', label: 'Greater than 20 minutes' }
			]}
			bind:value={c.anginaDuration}
		/>

		<RadioGroup label="Unstable angina (pain at rest or worsening pattern)?" name="unstableAngina" options={yesNo} bind:value={c.unstableAngina} />
	{/if}
</SectionCard>
