<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Primary reason for this pulmonology visit">
	<TextInput label="Primary symptom" name="primarySymptom" bind:value={c.primarySymptom} required />
	<TextInput label="Duration of symptoms" name="symptomDuration" bind:value={c.symptomDuration} placeholder="e.g., 6 months, 2 years" required />

	<SelectInput
		label="MRC Dyspnoea Grade"
		name="dyspnoeaGrade"
		options={[
			{ value: '1', label: 'Grade 1 - Breathless only with strenuous exercise' },
			{ value: '2', label: 'Grade 2 - Short of breath when hurrying on level ground' },
			{ value: '3', label: 'Grade 3 - Walks slower than contemporaries or stops for breath' },
			{ value: '4', label: 'Grade 4 - Stops for breath after ~100m on level ground' },
			{ value: '5', label: 'Grade 5 - Too breathless to leave the house or dress' }
		]}
		bind:value={c.dyspnoeaGradeMRC}
		required
	/>
</SectionCard>
