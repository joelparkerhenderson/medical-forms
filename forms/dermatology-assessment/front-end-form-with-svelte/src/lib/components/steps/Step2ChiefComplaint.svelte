<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Describe your primary skin concern">
	<TextArea
		label="What is your primary skin concern?"
		name="primaryConcern"
		bind:value={c.primaryConcern}
		placeholder="Describe your main skin problem..."
	/>

	<TextInput
		label="How long have you had this condition?"
		name="duration"
		bind:value={c.duration}
		placeholder="e.g., 2 weeks, 3 months, 5 years"
		required
	/>

	<TextInput
		label="Where on your body is it located?"
		name="location"
		bind:value={c.location}
		placeholder="e.g., face, arms, trunk, legs"
		required
	/>

	<RadioGroup
		label="How has the condition been changing?"
		name="progression"
		options={[
			{ value: 'stable', label: 'Stable' },
			{ value: 'improving', label: 'Improving' },
			{ value: 'worsening', label: 'Worsening' },
			{ value: 'fluctuating', label: 'Fluctuating' }
		]}
		bind:value={c.progression}
		required
	/>

	<TextArea
		label="Previous treatments tried"
		name="previousTreatments"
		bind:value={c.previousTreatments}
		placeholder="List any treatments you have tried for this condition..."
	/>
</SectionCard>
