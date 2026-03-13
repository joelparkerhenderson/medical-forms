<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.psychosocial;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Psychosocial" description="Depression screening, social isolation, caregiver status, and advance directives">
	<SelectInput
		label="Depression Screen (GDS-15) Result"
		name="depressionScreen"
		options={[
			{ value: 'normal', label: 'Normal (0-4)' },
			{ value: 'mild', label: 'Mild depression (5-8)' },
			{ value: 'moderate', label: 'Moderate depression (9-11)' },
			{ value: 'severe', label: 'Severe depression (12-15)' }
		]}
		bind:value={p.depressionScreen}
	/>

	<NumberInput label="GDS-15 Score" name="gds15Score" bind:value={p.gds15Score} min={0} max={15} />

	<SelectInput
		label="Social Isolation Level"
		name="socialIsolation"
		options={[
			{ value: 'none', label: 'No isolation - regular social contact' },
			{ value: 'mild', label: 'Mild - some social contact' },
			{ value: 'moderate', label: 'Moderate - limited social contact' },
			{ value: 'severe', label: 'Severe - very isolated, minimal contact' }
		]}
		bind:value={p.socialIsolation}
	/>

	<RadioGroup label="Does the patient have a caregiver?" name="hasCaregiver" options={yesNo} bind:value={p.hasCaregiver} />
	{#if p.hasCaregiver === 'yes'}
		<TextArea label="Caregiver details" name="caregiverDetails" bind:value={p.caregiverDetails} placeholder="e.g., spouse, adult child, paid carer, hours per week" />
	{/if}

	<RadioGroup label="Are there any advance directives, DNAR, or living wills in place?" name="advanceDirectives" options={yesNo} bind:value={p.advanceDirectives} />
	{#if p.advanceDirectives === 'yes'}
		<TextArea label="Advance directive details" name="advanceDirectiveDetails" bind:value={p.advanceDirectiveDetails} placeholder="e.g., DNAR, power of attorney, treatment preferences" />
	{/if}
</SectionCard>
