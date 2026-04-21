<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const lpa = assessment.data.lastingPowerOfAttorney;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Lasting Power of Attorney" description="Details of any Lasting Power of Attorney (LPA) that may affect this ADRT">
	<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
		<p class="font-semibold">Important Legal Interaction</p>
		<p class="mt-1">If you have a Health and Welfare LPA that was registered <strong>after</strong> you made this ADRT, the LPA attorney may have authority to consent to the treatments you have refused. It is important to clarify the relationship between your ADRT and any LPA.</p>
	</div>

	<RadioGroup
		label="Do you have a Lasting Power of Attorney (LPA)?"
		name="hasLPA"
		options={yesNo}
		bind:value={lpa.hasLPA}
	/>

	{#if lpa.hasLPA === 'yes'}
		<SelectInput
			label="Type of LPA"
			name="lpaType"
			options={[
				{ value: 'health-and-welfare', label: 'Health and Welfare' },
				{ value: 'property-and-financial', label: 'Property and Financial Affairs' },
				{ value: 'both', label: 'Both' }
			]}
			bind:value={lpa.lpaType}
			required
		/>

		<RadioGroup
			label="Is the LPA registered with the Office of the Public Guardian?"
			name="lpaRegistered"
			options={yesNo}
			bind:value={lpa.lpaRegistered}
		/>

		{#if lpa.lpaRegistered === 'yes'}
			<TextInput label="Registration Date" name="lpaRegistrationDate" type="date" bind:value={lpa.lpaRegistrationDate} />
		{/if}

		<TextInput label="Name(s) of Attorney(s) / Donee(s)" name="doneeNames" bind:value={lpa.doneeNames} />

		<TextArea
			label="Relationship between this ADRT and the LPA"
			name="relationshipBetweenADRTAndLPA"
			bind:value={lpa.relationshipBetweenADRTAndLPA}
			rows={4}
			placeholder="Describe how the ADRT and LPA interact. For example: 'This ADRT takes precedence over the LPA for the specific treatments refused.'"
		/>
	{/if}
</SectionCard>
