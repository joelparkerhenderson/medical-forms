<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { mrsLabel } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const f = assessment.data.functionalSocial;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	function handleMrsChange(val: string) {
		assessment.data.functionalSocial.mrsScore = val === '' ? null : (Number(val) as 0 | 1 | 2 | 3 | 4 | 5);
	}
</script>

<SectionCard title="Functional & Social Assessment" description="Disability, driving, employment, and support needs">
	<SelectInput
		label="Modified Rankin Scale (mRS)"
		name="mrsScore"
		options={[
			{ value: '0', label: '0 - No symptoms' },
			{ value: '1', label: '1 - No significant disability' },
			{ value: '2', label: '2 - Slight disability' },
			{ value: '3', label: '3 - Moderate disability (walks without assistance)' },
			{ value: '4', label: '4 - Moderately severe disability (unable to walk unaided)' },
			{ value: '5', label: '5 - Severe disability (bedridden, incontinent)' }
		]}
		value={f.mrsScore === null ? '' : String(f.mrsScore)}
		onchange={handleMrsChange}
	/>
	{#if f.mrsScore !== null}
		<div class="mb-4 text-sm text-gray-500">{mrsLabel(f.mrsScore)}</div>
	{/if}

	<SelectInput
		label="Driving status"
		name="drivingStatus"
		options={[
			{ value: 'driving', label: 'Currently driving' },
			{ value: 'not-driving-medical', label: 'Not driving - medical reasons' },
			{ value: 'not-driving-other', label: 'Not driving - other reasons' },
			{ value: 'not-applicable', label: 'Not applicable' }
		]}
		bind:value={f.drivingStatus}
	/>
	{#if f.drivingStatus === 'not-driving-medical'}
		<TextArea label="Driving restriction details" name="drivingDetails" bind:value={f.drivingRestrictionDetails} placeholder="e.g., seizure within last 12 months, DVLA notification" />
	{/if}

	<SelectInput
		label="Employment status"
		name="employmentStatus"
		options={[
			{ value: 'employed', label: 'Employed' },
			{ value: 'unemployed', label: 'Unemployed' },
			{ value: 'retired', label: 'Retired' },
			{ value: 'disability', label: 'On disability' },
			{ value: 'student', label: 'Student' }
		]}
		bind:value={f.employmentStatus}
	/>
	<TextArea label="Impact on employment/daily activities" name="employmentImpact" bind:value={f.employmentImpact} placeholder="How has the neurological condition affected work or daily life?" />

	<TextArea label="Support needs" name="supportNeeds" bind:value={f.supportNeeds} placeholder="e.g., physiotherapy, occupational therapy, speech therapy, social care" />

	<SelectInput
		label="Living situation"
		name="livingSituation"
		options={[
			{ value: 'independent', label: 'Independent' },
			{ value: 'with-family', label: 'With family/carer' },
			{ value: 'assisted-living', label: 'Assisted living' },
			{ value: 'nursing-home', label: 'Nursing home' }
		]}
		bind:value={f.livingSituation}
	/>

	<RadioGroup label="Is a care plan required?" name="carePlan" options={yesNo} bind:value={f.carePlanRequired} />
</SectionCard>
