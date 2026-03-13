<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Describe your primary urological concern">
	<TextArea
		label="What is your primary urological concern?"
		name="primaryConcern"
		bind:value={c.primaryConcern}
		placeholder="Describe your main urological problem..."
	/>

	<TextInput
		label="How long have you had this condition?"
		name="duration"
		bind:value={c.duration}
		placeholder="e.g., 2 weeks, 3 months, 5 years"
		required
	/>

	<RadioGroup
		label="How urgent is your concern?"
		name="urgency"
		options={[
			{ value: 'routine', label: 'Routine' },
			{ value: 'urgent', label: 'Urgent' },
			{ value: 'emergency', label: 'Emergency' }
		]}
		bind:value={c.urgency}
		required
	/>
</SectionCard>
