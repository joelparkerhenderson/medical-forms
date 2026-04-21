<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const f = assessment.data.functionalHistory;

	const adlOptions = [
		{ value: 'independent', label: 'Independent' },
		{ value: 'needs-some-help', label: 'Needs some help' },
		{ value: 'needs-significant-help', label: 'Needs significant help' },
		{ value: 'fully-dependent', label: 'Fully dependent' }
	];

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Functional History" description="Activities of daily living, living situation, and support network">
	<SelectInput
		label="Living Arrangement"
		name="livingArrangement"
		options={[
			{ value: 'alone', label: 'Lives alone' },
			{ value: 'with-spouse', label: 'Lives with spouse/partner' },
			{ value: 'with-family', label: 'Lives with family' },
			{ value: 'care-home', label: 'Care home/nursing home' },
			{ value: 'assisted-living', label: 'Assisted living facility' }
		]}
		bind:value={f.livingArrangement}
		required
	/>

	<h3 class="mb-3 mt-4 text-sm font-semibold text-gray-700">Activities of Daily Living (ADLs)</h3>

	<SelectInput label="Bathing" name="adlBathing" options={adlOptions} bind:value={f.adlBathing} />
	<SelectInput label="Dressing" name="adlDressing" options={adlOptions} bind:value={f.adlDressing} />
	<SelectInput label="Preparing Meals" name="adlMeals" options={adlOptions} bind:value={f.adlMeals} />
	<SelectInput label="Managing Medications" name="adlMedications" options={adlOptions} bind:value={f.adlMedications} />
	<SelectInput label="Managing Finances" name="adlFinances" options={adlOptions} bind:value={f.adlFinances} />
	<SelectInput label="Using Transport" name="adlTransport" options={adlOptions} bind:value={f.adlTransport} />

	<TextArea
		label="Recent changes in function or behaviour"
		name="recentChanges"
		bind:value={f.recentChanges}
		placeholder="Describe any recent changes in the patient's abilities, behaviour, or personality..."
	/>

	<TextArea
		label="Safety concerns"
		name="safetyConcerns"
		bind:value={f.safetyConerns}
		placeholder="e.g., leaving stove on, wandering, getting lost, falls, driving concerns..."
	/>

	<RadioGroup
		label="Are carers or support persons available?"
		name="carersAvailable"
		options={yesNo}
		bind:value={f.carersAvailable}
	/>
	{#if f.carersAvailable === 'yes'}
		<TextArea
			label="Carer details"
			name="carerDetails"
			bind:value={f.carerDetails}
			placeholder="Name and relationship of carer(s)..."
		/>
	{/if}
</SectionCard>
