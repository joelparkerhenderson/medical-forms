<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const cs = assessment.data.contraindicationsScreening;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Contraindications Screening" description="Please answer all questions carefully. These determine eligibility for semaglutide therapy.">
	<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
		Answering 'Yes' to any of the first seven questions may affect your eligibility for semaglutide treatment.
	</div>

	<RadioGroup
		label="Do you have a personal history of medullary thyroid carcinoma (MTC)?"
		name="personalHistoryMTC"
		options={yesNoOptions}
		bind:value={cs.personalHistoryMTC}
		required
	/>

	<RadioGroup
		label="Do you have a family history of medullary thyroid carcinoma (MTC)?"
		name="familyHistoryMTC"
		options={yesNoOptions}
		bind:value={cs.familyHistoryMTC}
		required
	/>

	<RadioGroup
		label="Have you been diagnosed with Multiple Endocrine Neoplasia syndrome type 2 (MEN2)?"
		name="men2Syndrome"
		options={yesNoOptions}
		bind:value={cs.men2Syndrome}
		required
	/>

	<RadioGroup
		label="Do you have a history of pancreatitis?"
		name="pancreatitisHistory"
		options={yesNoOptions}
		bind:value={cs.pancreatitisHistory}
		required
	/>

	<RadioGroup
		label="Do you have severe gastrointestinal disease?"
		name="severeGIDisease"
		options={yesNoOptions}
		bind:value={cs.severeGIDisease}
		required
	/>

	<RadioGroup
		label="Are you currently pregnant or planning to become pregnant?"
		name="pregnancyPlanned"
		options={yesNoOptions}
		bind:value={cs.pregnancyPlanned}
		required
	/>

	<RadioGroup
		label="Are you currently breastfeeding?"
		name="breastfeeding"
		options={yesNoOptions}
		bind:value={cs.breastfeeding}
		required
	/>

	<RadioGroup
		label="Do you have type 1 diabetes?"
		name="type1Diabetes"
		options={yesNoOptions}
		bind:value={cs.type1Diabetes}
		required
	/>

	<RadioGroup
		label="Do you have severe diabetic retinopathy?"
		name="diabeticRetinopathySevere"
		options={yesNoOptions}
		bind:value={cs.diabeticRetinopathySevere}
		required
	/>

	<RadioGroup
		label="Do you have a known allergy or hypersensitivity to semaglutide?"
		name="allergySemaglutide"
		options={yesNoOptions}
		bind:value={cs.allergySemaglutide}
		required
	/>
</SectionCard>
