<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Primary respiratory symptom and timeline">
	<TextArea
		label="Primary Respiratory Symptom"
		name="primarySymptom"
		bind:value={c.primarySymptom}
		placeholder="Describe the main breathing or respiratory problem..."
	/>

	<TextInput
		label="Onset Date"
		name="onsetDate"
		type="date"
		bind:value={c.onsetDate}
	/>

	<TextInput
		label="Duration"
		name="duration"
		bind:value={c.duration}
		placeholder="e.g. 3 months, 2 years, acute onset"
	/>

	<NumberInput
		label="Severity Rating (1-10)"
		name="severityRating"
		bind:value={c.severityRating}
		min={1}
		max={10}
		step={1}
	/>
</SectionCard>
