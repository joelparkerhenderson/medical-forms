<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const p = casualtyCard.data.painAssessment;
</script>

<SectionCard title="Pain Assessment" description="Numeric Rating Scale (NRS) pain evaluation">
	<RadioGroup
		label="Is the patient in pain?"
		name="painPresent"
		bind:value={p.painPresent}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>

	{#if p.painPresent === 'yes'}
		<NumberInput label="Pain Score" name="painScore" bind:value={p.painScore} min={0} max={10} unit="0-10 NRS" />
		<TextInput label="Pain Location" name="painLocation" bind:value={p.painLocation} />
		<TextInput label="Pain Character" name="painCharacter" bind:value={p.painCharacter} placeholder="e.g. sharp, aching, burning, throbbing" />
		<TextInput label="Pain Onset" name="painOnset" bind:value={p.painOnset} placeholder="e.g. sudden, gradual" />
		<RadioGroup
			label="Pain Severity Category"
			name="painSeverityCategory"
			bind:value={p.painSeverityCategory}
			options={[
				{ value: 'mild', label: 'Mild (1-3)' },
				{ value: 'moderate', label: 'Moderate (4-6)' },
				{ value: 'severe', label: 'Severe (7-10)' }
			]}
		/>
	{/if}
</SectionCard>
