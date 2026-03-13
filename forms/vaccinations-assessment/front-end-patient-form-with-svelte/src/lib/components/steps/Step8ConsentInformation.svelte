<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumericSelect from '$lib/components/ui/NumericSelect.svelte';

	const ci = assessment.data.consentInformation;

	const likertOptions = [
		{ value: '1', label: '1 - Very Poor' },
		{ value: '2', label: '2 - Poor' },
		{ value: '3', label: '3 - Average' },
		{ value: '4', label: '4 - Good' },
		{ value: '5', label: '5 - Excellent' }
	];
</script>

<SectionCard title="Consent & Information" description="Record consent quality and information provision. Rate 1 (Very Poor) to 5 (Excellent).">
	<NumericSelect label="Information provided about the vaccine" name="informationProvided" options={likertOptions} bind:numericValue={ci.informationProvided} />
	<NumericSelect label="Risks explained" name="risksExplained" options={likertOptions} bind:numericValue={ci.risksExplained} />
	<NumericSelect label="Benefits explained" name="benefitsExplained" options={likertOptions} bind:numericValue={ci.benefitsExplained} />
	<NumericSelect label="Questions answered satisfactorily" name="questionsAnswered" options={likertOptions} bind:numericValue={ci.questionsAnswered} />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup label="Consent given?" name="consentGiven" options={[ { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' } ]} bind:value={ci.consentGiven} />
		<TextInput label="Consent Date" name="consentDate" type="date" bind:value={ci.consentDate} />
	</div>

	<RadioGroup
		label="Guardian/parent consent (if minor)?"
		name="guardianConsent"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' },
			{ value: 'notApplicable', label: 'N/A' }
		]}
		bind:value={ci.guardianConsent}
	/>
</SectionCard>
