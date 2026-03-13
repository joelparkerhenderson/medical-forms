<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.capacityDeclaration;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Capacity Declaration" description="Confirmation that you have the mental capacity to make this decision">
	<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<p class="font-semibold">Important Legal Notice</p>
		<p class="mt-1">Under the Mental Capacity Act 2005, you must have the mental capacity to make this advance decision. This means you must be able to understand, retain, and weigh the information relevant to the decision, and communicate your decision.</p>
	</div>

	<RadioGroup
		label="I confirm that I have the mental capacity to make this advance decision"
		name="confirmsCapacity"
		options={yesNo}
		bind:value={c.confirmsCapacity}
		required
	/>

	<RadioGroup
		label="I understand the consequences of refusing the treatments specified in this document, including that I may die as a result"
		name="understandsConsequences"
		options={yesNo}
		bind:value={c.understandsConsequences}
		required
	/>

	<RadioGroup
		label="I confirm that I am making this decision freely and without undue influence from any other person"
		name="noUndueInfluence"
		options={yesNo}
		bind:value={c.noUndueInfluence}
		required
	/>

	<div class="mt-6 border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Professional Capacity Assessment (if available)</h3>
		<RadioGroup
			label="Has a healthcare professional assessed your mental capacity?"
			name="professionalCapacityAssessment"
			options={yesNo}
			bind:value={c.professionalCapacityAssessment}
		/>
		{#if c.professionalCapacityAssessment === 'yes'}
			<TextInput label="Assessed by (name)" name="assessedByName" bind:value={c.assessedByName} />
			<TextInput label="Role/Title" name="assessedByRole" bind:value={c.assessedByRole} />
			<TextInput label="Assessment Date" name="assessmentDate" type="date" bind:value={c.assessmentDate} />
			<TextArea label="Assessment Details" name="assessmentDetails" bind:value={c.assessmentDetails} placeholder="Summary of the capacity assessment findings" />
		{/if}
	</div>
</SectionCard>
