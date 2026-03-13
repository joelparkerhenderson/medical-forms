<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const f = assessment.data.familyHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Family History" description="Skin conditions and relevant diseases in your family">
	<RadioGroup label="Does anyone in your family have psoriasis?" name="fhPsoriasis" options={yesNo} bind:value={f.psoriasis} />

	<RadioGroup label="Does anyone in your family have eczema/atopic dermatitis?" name="fhEczema" options={yesNo} bind:value={f.eczema} />

	<RadioGroup label="Does anyone in your family have a history of melanoma?" name="fhMelanoma" options={yesNo} bind:value={f.melanoma} />

	<RadioGroup label="Does anyone in your family have a history of non-melanoma skin cancer?" name="fhSkinCancer" options={yesNo} bind:value={f.skinCancer} />

	<RadioGroup label="Does anyone in your family have an autoimmune disease?" name="fhAutoimmune" options={yesNo} bind:value={f.autoimmune} />

	<TextArea
		label="Any other relevant family history"
		name="fhOther"
		bind:value={f.otherDetails}
		placeholder="Please describe any other skin-related conditions in your family..."
	/>
</SectionCard>
