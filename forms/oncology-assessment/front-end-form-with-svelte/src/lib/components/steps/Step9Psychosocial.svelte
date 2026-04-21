<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.psychosocial;

	const severityOptions = [
		{ value: 'none', label: 'None' },
		{ value: 'mild', label: 'Mild' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'severe', label: 'Severe' }
	];

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Psychosocial" description="Emotional wellbeing, coping, and support">
	<NumberInput label="Distress Thermometer" name="distress" bind:value={p.distressThermometer} min={0} max={10} step={1} />
	<p class="mt-[-12px] mb-4 text-xs text-gray-500">0 = no distress, 10 = extreme distress</p>

	<SelectInput label="Anxiety" name="anxiety" options={severityOptions} bind:value={p.anxiety} />

	<SelectInput label="Depression" name="depression" options={severityOptions} bind:value={p.depression} />

	<SelectInput
		label="Coping Ability"
		name="copingAbility"
		options={[
			{ value: 'coping-well', label: 'Coping well' },
			{ value: 'some-difficulty', label: 'Some difficulty coping' },
			{ value: 'significant-difficulty', label: 'Significant difficulty coping' }
		]}
		bind:value={p.copingAbility}
	/>

	<SelectInput
		label="Support System"
		name="supportSystem"
		options={[
			{ value: 'strong', label: 'Strong support' },
			{ value: 'moderate', label: 'Moderate support' },
			{ value: 'limited', label: 'Limited support' },
			{ value: 'none', label: 'No support' }
		]}
		bind:value={p.supportSystem}
	/>

	<RadioGroup label="Advance care planning documented?" name="advanceCare" options={yesNo} bind:value={p.advanceCarePlanning} />
	{#if p.advanceCarePlanning === 'yes'}
		<TextArea label="Advance care planning details" name="advanceCareDetails" bind:value={p.advanceCareDetails} placeholder="e.g., DNACPR, preferred place of care" />
	{/if}
</SectionCard>
