<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const e = assessment.data.ethnicBackground;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Ethnic Background & Consanguinity" description="Ethnic heritage and family relationships relevant to genetic risk">
	<TextInput
		label="Ethnicity / ancestral background"
		name="ethnicity"
		bind:value={e.ethnicity}
		placeholder="e.g., European, South Asian, East Asian, African, Mixed..."
	/>

	<RadioGroup label="Are you of Ashkenazi Jewish descent?" name="ashkenaziJewish" options={yesNo} bind:value={e.ashkenaziJewish} />

	<RadioGroup label="Is there consanguinity (blood relationship) in your family?" name="ethnicConsanguinity" options={yesNo} bind:value={e.consanguinity} />
	{#if e.consanguinity === 'yes'}
		<TextArea
			label="Please provide details"
			name="consanguinityDetails"
			bind:value={e.consanguinityDetails}
			placeholder="Describe the relationship (e.g., first cousins, second cousins)..."
		/>
	{/if}
</SectionCard>
