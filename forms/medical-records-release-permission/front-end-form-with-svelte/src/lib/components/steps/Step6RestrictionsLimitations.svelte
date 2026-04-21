<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const r = assessment.data.restrictionsLimitations;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes - Exclude' },
		{ value: 'no', label: 'No - Include' }
	];
</script>

<SectionCard title="Restrictions & Limitations" description="Indicate whether the following sensitive record categories should be excluded from the release">
	<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
		<p class="font-medium">Sensitive Information</p>
		<p class="mt-1">
			The following categories may require additional consent under applicable data protection laws.
			Select "Yes - Exclude" to prevent these records from being released.
		</p>
	</div>

	<RadioGroup
		label="Exclude HIV-related records?"
		name="excludeHIV"
		options={yesNoOptions}
		bind:value={r.excludeHIV}
	/>

	<RadioGroup
		label="Exclude substance abuse treatment records?"
		name="excludeSubstanceAbuse"
		options={yesNoOptions}
		bind:value={r.excludeSubstanceAbuse}
	/>

	<RadioGroup
		label="Exclude mental health records?"
		name="excludeMentalHealth"
		options={yesNoOptions}
		bind:value={r.excludeMentalHealth}
	/>

	<RadioGroup
		label="Exclude genetic information?"
		name="excludeGeneticInfo"
		options={yesNoOptions}
		bind:value={r.excludeGeneticInfo}
	/>

	<RadioGroup
		label="Exclude STI-related records?"
		name="excludeSTI"
		options={yesNoOptions}
		bind:value={r.excludeSTI}
	/>

	<TextArea
		label="Additional restrictions or limitations"
		name="additionalRestrictions"
		bind:value={r.additionalRestrictions}
		placeholder="Describe any other restrictions on the records release..."
	/>
</SectionCard>
