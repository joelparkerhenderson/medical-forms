<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const a = assessment.data.anesthesiaInformation;
</script>

<SectionCard title="Anesthesia Information" description="Details about the planned anesthesia and any prior issues">
	<SelectInput
		label="Anesthesia Type"
		name="anesthesiaType"
		options={[
			{ value: 'general', label: 'General Anesthesia' },
			{ value: 'regional', label: 'Regional Anesthesia' },
			{ value: 'local', label: 'Local Anesthesia' },
			{ value: 'sedation', label: 'Sedation' },
			{ value: 'none', label: 'None' }
		]}
		bind:value={a.anesthesiaType}
		required
	/>

	<TextArea
		label="Anesthesia Risks"
		name="anesthesiaRisks"
		bind:value={a.anesthesiaRisks}
		placeholder="Document specific anesthesia risks discussed with the patient..."
		rows={3}
	/>

	<RadioGroup
		label="Previous Anesthesia Problems"
		name="previousAnesthesiaProblems"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={a.previousAnesthesiaProblems}
		required
	/>

	{#if a.previousAnesthesiaProblems === 'yes'}
		<TextArea
			label="Previous Anesthesia Problem Details"
			name="previousAnesthesiaDetails"
			bind:value={a.previousAnesthesiaDetails}
			placeholder="Describe previous anesthesia problems in detail..."
			rows={3}
		/>
	{/if}

	<TextArea
		label="Fasting Instructions"
		name="fastingInstructions"
		bind:value={a.fastingInstructions}
		placeholder="e.g., No food for 6 hours, clear fluids until 2 hours before procedure..."
		rows={2}
	/>
</SectionCard>
