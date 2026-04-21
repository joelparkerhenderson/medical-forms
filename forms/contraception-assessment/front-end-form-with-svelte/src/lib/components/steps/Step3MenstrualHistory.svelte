<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const m = assessment.data.menstrualHistory;
</script>

<SectionCard title="Menstrual History" description="Details about your menstrual cycle">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Cycle length"
			name="cycleLength"
			bind:value={m.cycleLength}
			unit="days"
			min={14}
			max={60}
		/>
		<NumberInput
			label="Period duration"
			name="cycleDuration"
			bind:value={m.cycleDuration}
			unit="days"
			min={1}
			max={14}
		/>
	</div>

	<SelectInput
		label="Flow heaviness"
		name="flowHeaviness"
		options={[
			{ value: 'light', label: 'Light' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'heavy', label: 'Heavy' },
			{ value: 'very-heavy', label: 'Very heavy (flooding/clots)' }
		]}
		bind:value={m.flowHeaviness}
	/>

	<SelectInput
		label="Period pain (dysmenorrhea)"
		name="dysmenorrhea"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'mild', label: 'Mild - manageable without medication' },
			{ value: 'moderate', label: 'Moderate - requires pain relief' },
			{ value: 'severe', label: 'Severe - affects daily activities' }
		]}
		bind:value={m.dysmenorrhea}
	/>

	<TextInput
		label="Date of last menstrual period"
		name="lastMenstrualPeriod"
		type="date"
		bind:value={m.lastMenstrualPeriod}
	/>
</SectionCard>
