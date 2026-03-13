<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const s = assessment.data.symptomOnset;
</script>

<SectionCard title="Symptom Onset" description="Time and manner of symptom presentation">
	<TextInput
		label="Symptom Onset Time"
		name="onsetTime"
		type="text"
		bind:value={s.onsetTime}
		placeholder="e.g., 2026-03-08T14:30"
		required
	/>

	<TextInput
		label="Last Known Well"
		name="lastKnownWell"
		type="text"
		bind:value={s.lastKnownWell}
		placeholder="e.g., 2026-03-08T12:00"
	/>

	<RadioGroup
		label="Symptom Progression"
		name="symptomProgression"
		options={[
			{ value: 'sudden', label: 'Sudden' },
			{ value: 'gradual', label: 'Gradual' },
			{ value: 'fluctuating', label: 'Fluctuating' },
			{ value: 'improving', label: 'Improving' }
		]}
		bind:value={s.symptomProgression}
		required
	/>

	<SelectInput
		label="Mode of Arrival"
		name="modeOfArrival"
		options={[
			{ value: 'ambulance', label: 'Ambulance' },
			{ value: 'private-vehicle', label: 'Private Vehicle' },
			{ value: 'walk-in', label: 'Walk-in' },
			{ value: 'transfer', label: 'Hospital Transfer' }
		]}
		bind:value={s.modeOfArrival}
		required
	/>
</SectionCard>
