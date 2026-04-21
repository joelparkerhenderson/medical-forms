<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Primary reason for gastroenterology referral">
	<TextArea
		label="What is your primary GI symptom?"
		name="primarySymptom"
		bind:value={c.primarySymptom}
		placeholder="Describe your main symptom..."
	/>

	<SelectInput
		label="Where is the symptom located?"
		name="symptomLocation"
		options={[
			{ value: 'epigastric', label: 'Epigastric (upper centre)' },
			{ value: 'right-upper-quadrant', label: 'Right upper quadrant' },
			{ value: 'left-upper-quadrant', label: 'Left upper quadrant' },
			{ value: 'periumbilical', label: 'Periumbilical (around navel)' },
			{ value: 'right-lower-quadrant', label: 'Right lower quadrant' },
			{ value: 'left-lower-quadrant', label: 'Left lower quadrant' },
			{ value: 'suprapubic', label: 'Suprapubic (lower centre)' },
			{ value: 'diffuse', label: 'Diffuse (all over)' }
		]}
		bind:value={c.symptomLocation}
	/>

	<TextInput label="When did the symptom start?" name="symptomOnset" bind:value={c.symptomOnset} placeholder="e.g. 3 months ago" />

	<TextInput label="How long does it last?" name="symptomDuration" bind:value={c.symptomDuration} placeholder="e.g. constant, minutes, hours" />

	<NumberInput
		label="How severe is your symptom on a scale of 0-10?"
		name="severityScore"
		bind:value={c.severityScore}
		min={0}
		max={10}
		step={1}
	/>
	<p class="mt-[-12px] mb-4 text-xs text-gray-500">0 = no symptoms, 10 = worst imaginable</p>
</SectionCard>
