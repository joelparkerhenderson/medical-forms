<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const fl = assessment.data.functionalLimitations;
</script>

<SectionCard title="Functional Limitations" description="Describe how your condition affects your daily activities">
	<CheckboxGroup
		label="Difficulty with Activities of Daily Living"
		options={[
			{ value: 'dressing', label: 'Dressing' },
			{ value: 'bathing', label: 'Bathing' },
			{ value: 'cooking', label: 'Cooking' },
			{ value: 'cleaning', label: 'Cleaning' },
			{ value: 'driving', label: 'Driving' },
			{ value: 'writing', label: 'Writing' },
			{ value: 'typing', label: 'Typing' },
			{ value: 'lifting', label: 'Lifting' },
			{ value: 'carrying', label: 'Carrying' },
			{ value: 'reaching-overhead', label: 'Reaching overhead' },
			{ value: 'gripping', label: 'Gripping objects' },
			{ value: 'opening-jars', label: 'Opening jars' }
		]}
		bind:values={fl.difficultyWithADLs}
	/>

	<CheckboxGroup
		label="Mobility Aids Currently Used"
		options={[
			{ value: 'sling', label: 'Sling' },
			{ value: 'brace', label: 'Brace' },
			{ value: 'splint', label: 'Splint' },
			{ value: 'cane', label: 'Cane' },
			{ value: 'crutches', label: 'Crutches' },
			{ value: 'walker', label: 'Walker' },
			{ value: 'wheelchair', label: 'Wheelchair' },
			{ value: 'none', label: 'None' }
		]}
		bind:values={fl.mobilityAids}
	/>

	<TextArea
		label="Work Restrictions"
		name="workRestrictions"
		bind:value={fl.workRestrictions}
		placeholder="Describe any work limitations or restrictions..."
	/>

	<TextArea
		label="Sport/Recreation Restrictions"
		name="sportRestrictions"
		bind:value={fl.sportRestrictions}
		placeholder="Describe any sport or recreational activity limitations..."
	/>
</SectionCard>
