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

<SectionCard title="Family History" description="Gynaecological and relevant conditions in your family">
	<RadioGroup label="Does anyone in your family have a history of breast cancer?" name="fhBreastCancer" options={yesNo} bind:value={f.breastCancer} />

	<RadioGroup label="Does anyone in your family have a history of ovarian cancer?" name="fhOvarianCancer" options={yesNo} bind:value={f.ovarianCancer} />

	<RadioGroup label="Does anyone in your family have a history of cervical cancer?" name="fhCervicalCancer" options={yesNo} bind:value={f.cervicalCancer} />

	<RadioGroup label="Does anyone in your family have endometriosis?" name="fhEndometriosis" options={yesNo} bind:value={f.endometriosis} />

	<RadioGroup label="Does anyone in your family have polycystic ovary syndrome (PCOS)?" name="fhPcos" options={yesNo} bind:value={f.pcos} />

	<TextArea
		label="Any other relevant family history"
		name="fhOther"
		bind:value={f.otherDetails}
		placeholder="Please describe any other relevant family conditions..."
	/>
</SectionCard>
