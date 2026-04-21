<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Primary neurological symptom and presentation">
	<TextArea label="Primary neurological symptom" name="primarySymptom" bind:value={c.primarySymptom} placeholder="Describe the main symptom (e.g., weakness, numbness, headache, seizure)" required />

	<TextInput label="Onset date" name="onsetDate" type="date" bind:value={c.onsetDate} />

	<RadioGroup
		label="Onset type"
		name="onsetType"
		options={[
			{ value: 'sudden', label: 'Sudden' },
			{ value: 'gradual', label: 'Gradual' }
		]}
		bind:value={c.onsetType}
	/>

	<TextInput label="Duration" name="duration" bind:value={c.duration} placeholder="e.g., 2 hours, 3 days, ongoing" />

	<RadioGroup
		label="Progression"
		name="progression"
		options={[
			{ value: 'improving', label: 'Improving' },
			{ value: 'stable', label: 'Stable' },
			{ value: 'worsening', label: 'Worsening' }
		]}
		bind:value={c.progression}
	/>

	<TextArea label="Associated symptoms" name="associatedSymptoms" bind:value={c.associatedSymptoms} placeholder="e.g., nausea, vomiting, vision changes, speech difficulty" />

	<TextArea label="Precipitating event" name="precipitatingEvent" bind:value={c.precipitatingEvent} placeholder="e.g., trauma, exertion, stress, none" />
</SectionCard>
