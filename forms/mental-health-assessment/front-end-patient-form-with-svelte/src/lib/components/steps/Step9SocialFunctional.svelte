<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const sf = assessment.data.socialFunctional;
</script>

<SectionCard title="Social & Functional" description="Your social circumstances and daily functioning">
	<SelectInput
		label="Employment Status"
		name="employmentStatus"
		options={[
			{ value: 'employed-full-time', label: 'Employed Full-Time' },
			{ value: 'employed-part-time', label: 'Employed Part-Time' },
			{ value: 'unemployed', label: 'Unemployed' },
			{ value: 'retired', label: 'Retired' },
			{ value: 'disabled', label: 'Disabled' },
			{ value: 'student', label: 'Student' }
		]}
		bind:value={sf.employmentStatus}
	/>

	<SelectInput
		label="Relationship Status"
		name="relationshipStatus"
		options={[
			{ value: 'single', label: 'Single' },
			{ value: 'married', label: 'Married' },
			{ value: 'partnered', label: 'Partnered' },
			{ value: 'divorced', label: 'Divorced' },
			{ value: 'widowed', label: 'Widowed' },
			{ value: 'separated', label: 'Separated' }
		]}
		bind:value={sf.relationshipStatus}
	/>

	<RadioGroup
		label="Housing Status"
		name="housingStatus"
		options={[
			{ value: 'stable', label: 'Stable' },
			{ value: 'unstable', label: 'Unstable' },
			{ value: 'homeless', label: 'Homeless' }
		]}
		bind:value={sf.housingStatus}
	/>

	<RadioGroup
		label="Support System"
		name="supportSystem"
		options={[
			{ value: 'strong', label: 'Strong' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'limited', label: 'Limited' },
			{ value: 'none', label: 'None' }
		]}
		bind:value={sf.supportSystem}
	/>

	<RadioGroup
		label="How much do mental health symptoms affect your daily functioning?"
		name="functionalImpairment"
		options={[
			{ value: 'none', label: 'Not at all' },
			{ value: 'mild', label: 'Mildly' },
			{ value: 'moderate', label: 'Moderately' },
			{ value: 'severe', label: 'Severely' }
		]}
		bind:value={sf.functionalImpairment}
	/>

	<TextArea
		label="Additional notes or concerns"
		name="additionalNotes"
		bind:value={sf.additionalNotes}
		placeholder="Anything else you would like your clinician to know"
	/>
</SectionCard>
