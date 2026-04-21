<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const h = assessment.data.healthcareProfessionalReview;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Healthcare Professional Review" description="Details of the clinician who reviewed this ADRT">
	<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<p class="font-semibold">Recommended</p>
		<p class="mt-1">While not a strict legal requirement, having a healthcare professional review your ADRT significantly strengthens its validity. A clinician can confirm your understanding of the treatment refusals and their consequences.</p>
	</div>

	<TextInput label="Reviewing Clinician Name" name="reviewedByClinicianName" bind:value={h.reviewedByClinicianName} />
	<TextInput label="Role / Title" name="reviewedByClinicianRole" bind:value={h.reviewedByClinicianRole} placeholder="e.g. Consultant, GP, Specialist Nurse" />
	<TextInput label="Review Date" name="reviewDate" type="date" bind:value={h.reviewDate} />

	<TextArea
		label="Clinical Opinion on Capacity"
		name="clinicalOpinionOnCapacity"
		bind:value={h.clinicalOpinionOnCapacity}
		rows={4}
		placeholder="Clinician's assessment of the patient's mental capacity to make this advance decision"
	/>

	<RadioGroup
		label="Does the reviewing clinician have any concerns about this ADRT?"
		name="anyConcerns"
		options={yesNo}
		bind:value={h.anyConcerns}
	/>
	{#if h.anyConcerns === 'yes'}
		<TextArea
			label="Details of concerns"
			name="concernsDetails"
			bind:value={h.concernsDetails}
			rows={4}
			placeholder="Please describe the concerns"
		/>
	{/if}
</SectionCard>
