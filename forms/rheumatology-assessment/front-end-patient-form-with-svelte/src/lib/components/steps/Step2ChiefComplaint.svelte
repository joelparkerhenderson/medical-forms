<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Primary joint complaint and symptom details">
	<TextArea
		label="Primary Joint Complaint"
		name="primaryJointComplaint"
		bind:value={d.primaryJointComplaint}
		placeholder="Describe your main joint complaint..."
	/>

	<TextInput label="Onset Date" name="onsetDate" type="date" bind:value={d.onsetDate} />

	<NumberInput
		label="Duration of Symptoms"
		name="durationMonths"
		bind:value={d.durationMonths}
		unit="months"
		min={0}
		max={600}
	/>

	<NumberInput
		label="Morning Stiffness Duration"
		name="morningStiffness"
		bind:value={d.morningStiffnessDurationMinutes}
		unit="minutes"
		min={0}
		max={1440}
	/>

	<RadioGroup
		label="Symmetric Joint Involvement"
		name="symmetricInvolvement"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={d.symmetricInvolvement}
	/>
</SectionCard>
