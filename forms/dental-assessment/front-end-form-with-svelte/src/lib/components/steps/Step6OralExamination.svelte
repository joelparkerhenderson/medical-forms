<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const o = assessment.data.oralExamination;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Oral Examination" description="Soft tissue, TMJ, and occlusion findings">
	<TextArea
		label="Soft tissue findings"
		name="softTissueFindings"
		bind:value={o.softTissueFindings}
		placeholder="e.g. Normal mucosa, no lesions; or describe any findings"
	/>

	<RadioGroup label="TMJ pain?" name="tmjPain" options={yesNo} bind:value={o.tmjPain} />
	<RadioGroup label="TMJ clicking or crepitus?" name="tmjClicking" options={yesNo} bind:value={o.tmjClicking} />
	<RadioGroup label="Limited jaw opening?" name="tmjLimitedOpening" options={yesNo} bind:value={o.tmjLimitedOpening} />

	<SelectInput
		label="Occlusion classification"
		name="occlusion"
		options={[
			{ value: 'class-I', label: 'Class I - Normal' },
			{ value: 'class-II', label: 'Class II - Retrognathic' },
			{ value: 'class-III', label: 'Class III - Prognathic' }
		]}
		bind:value={o.occlusion}
	/>

	<RadioGroup
		label="Oral hygiene index"
		name="oralHygieneIndex"
		options={[
			{ value: 'good', label: 'Good' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'poor', label: 'Poor' }
		]}
		bind:value={o.oralHygieneIndex}
	/>
</SectionCard>
