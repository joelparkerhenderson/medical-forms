<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import MedicationEntry from '$lib/components/ui/MedicationEntry.svelte';

	const cs = assessment.data.currentSupport;
</script>

<SectionCard title="Current Support" description="Current accommodations, therapies, and support services">
	<TextArea
		label="Current accommodations"
		name="currentAccommodations"
		bind:value={cs.currentAccommodations}
		placeholder="e.g., workplace adjustments, exam accommodations, environmental modifications..."
	/>

	<CheckboxGroup
		label="Current therapies"
		options={[
			{ value: 'speech-language', label: 'Speech & Language Therapy' },
			{ value: 'occupational', label: 'Occupational Therapy' },
			{ value: 'behavioral', label: 'Behavioral Therapy (ABA)' },
			{ value: 'cbt', label: 'Cognitive Behavioral Therapy' },
			{ value: 'social-skills', label: 'Social Skills Training' },
			{ value: 'sensory-integration', label: 'Sensory Integration Therapy' },
			{ value: 'psychotherapy', label: 'Psychotherapy / Counselling' },
			{ value: 'other', label: 'Other' }
		]}
		bind:values={cs.currentTherapies}
	/>

	<TextArea
		label="Educational support"
		name="educationalSupport"
		bind:value={cs.educationalSupport}
		placeholder="e.g., EHCP, SEN support, teaching assistant, special school, mainstream with support..."
	/>

	<div class="mb-4">
		<label class="mb-2 block text-sm font-medium text-gray-700">Current Medications</label>
		<MedicationEntry bind:medications={cs.medications} />
	</div>
</SectionCard>
