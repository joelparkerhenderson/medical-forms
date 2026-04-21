<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.circumstances;
</script>

<SectionCard title="Circumstances" description="Describe the specific circumstances when this ADRT should apply">
	<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<p class="font-semibold">Guidance</p>
		<p class="mt-1">Be as specific as possible about when this ADRT applies. The more precise your description, the easier it will be for healthcare professionals to determine whether the circumstances match your wishes.</p>
	</div>

	<TextArea
		label="Specific Circumstances"
		name="specificCircumstances"
		bind:value={c.specificCircumstances}
		rows={5}
		placeholder="e.g. 'In the event that I develop advanced dementia and can no longer recognise my family or communicate meaningfully...'"
	/>

	<TextArea
		label="Medical Conditions / Situations"
		name="medicalConditions"
		bind:value={c.medicalConditions}
		rows={4}
		placeholder="Describe any existing or anticipated medical conditions relevant to this ADRT"
	/>

	<TextArea
		label="Additional Situation Description"
		name="situationsDescription"
		bind:value={c.situationsDescription}
		rows={4}
		placeholder="Any further details about the circumstances in which this ADRT should apply"
	/>
</SectionCard>
