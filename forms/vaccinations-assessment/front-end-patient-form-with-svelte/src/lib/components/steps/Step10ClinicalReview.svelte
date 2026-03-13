<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumericSelect from '$lib/components/ui/NumericSelect.svelte';

	const cr = assessment.data.clinicalReview;

	const likertOptions = [
		{ value: '1', label: '1 - Very Poor' },
		{ value: '2', label: '2 - Poor' },
		{ value: '3', label: '3 - Average' },
		{ value: '4', label: '4 - Good' },
		{ value: '5', label: '5 - Excellent' }
	];
</script>

<SectionCard title="Clinical Review" description="Record post-vaccination observations and clinical follow-up plan.">
	<NumericSelect label="Post-vaccination observation quality" name="postVaccinationObservation" options={likertOptions} bind:numericValue={cr.postVaccinationObservation} />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup label="Any immediate reaction?" name="immediateReaction" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={cr.immediateReaction} />
		<TextArea label="If yes, describe reaction" name="reactionDetails" bind:value={cr.reactionDetails} placeholder="Describe any immediate reaction..." />
	</div>

	<TextInput label="Next Dose Due Date" name="nextDoseDue" type="date" bind:value={cr.nextDoseDue} />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup label="Catch-up schedule needed?" name="catchUpScheduleNeeded" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={cr.catchUpScheduleNeeded} />
		<RadioGroup label="Specialist referral needed?" name="referralNeeded" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={cr.referralNeeded} />
	</div>

	<TextArea label="Clinician Notes" name="clinicianNotes" bind:value={cr.clinicianNotes} rows={4} placeholder="Additional clinical notes..." />
	<TextInput label="Reviewing Clinician" name="reviewingClinician" bind:value={cr.reviewingClinician} placeholder="e.g. Dr Smith" />
</SectionCard>
