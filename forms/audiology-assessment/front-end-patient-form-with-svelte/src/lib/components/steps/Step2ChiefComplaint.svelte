<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Primary hearing concern and symptoms">
	<TextArea
		label="What is your primary hearing concern?"
		name="primaryConcern"
		bind:value={c.primaryConcern}
		placeholder="Describe your main hearing difficulty..."
	/>

	<RadioGroup
		label="Which ear is affected?"
		name="affectedEar"
		options={[
			{ value: 'left', label: 'Left' },
			{ value: 'right', label: 'Right' },
			{ value: 'both', label: 'Both' }
		]}
		bind:value={c.affectedEar}
		required
	/>

	<RadioGroup
		label="How did the hearing difficulty start?"
		name="onset"
		options={[
			{ value: 'sudden', label: 'Sudden' },
			{ value: 'gradual', label: 'Gradual' }
		]}
		bind:value={c.onset}
		required
	/>

	<TextInput
		label="How long have you had this hearing concern?"
		name="duration"
		bind:value={c.duration}
		placeholder="e.g., 6 months, 2 years"
	/>

	<SelectInput
		label="Has the hearing difficulty changed over time?"
		name="progression"
		options={[
			{ value: 'stable', label: 'Stable - no change' },
			{ value: 'worsening', label: 'Worsening - getting worse' },
			{ value: 'fluctuating', label: 'Fluctuating - comes and goes' },
			{ value: 'improving', label: 'Improving - getting better' }
		]}
		bind:value={c.progression}
	/>
</SectionCard>
