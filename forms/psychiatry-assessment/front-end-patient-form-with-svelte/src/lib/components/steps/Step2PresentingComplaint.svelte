<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const p = assessment.data.presentingComplaint;
</script>

<SectionCard title="Presenting Complaint" description="Current reason for assessment">
	<TextArea label="Chief Complaint" name="chiefComplaint" bind:value={p.chiefComplaint} placeholder="Describe the primary reason for presentation" rows={4} />

	<TextInput label="Onset Date" name="onsetDate" type="date" bind:value={p.onsetDate} />

	<TextInput label="Duration" name="duration" bind:value={p.duration} placeholder="e.g. 3 weeks, 6 months" />

	<RadioGroup
		label="Severity"
		name="severity"
		options={[
			{ value: 'mild', label: 'Mild' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'severe', label: 'Severe' }
		]}
		bind:value={p.severity}
	/>

	<TextArea label="Precipitating Factors" name="precipitatingFactors" bind:value={p.precipitatingFactors} placeholder="Events or circumstances leading to current presentation" />
</SectionCard>
