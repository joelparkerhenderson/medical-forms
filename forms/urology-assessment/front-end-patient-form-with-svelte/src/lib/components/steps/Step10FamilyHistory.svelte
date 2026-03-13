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

<SectionCard title="Family History" description="Urological and relevant conditions in your family">
	<RadioGroup label="Does anyone in your family have a history of prostate cancer?" name="fhProstateCancer" options={yesNo} bind:value={f.prostateCancer} />

	<RadioGroup label="Does anyone in your family have a history of bladder cancer?" name="fhBladderCancer" options={yesNo} bind:value={f.bladderCancer} />

	<RadioGroup label="Does anyone in your family have a history of kidney disease?" name="fhKidneyDisease" options={yesNo} bind:value={f.kidneyDisease} />

	<TextArea
		label="Any other relevant family history"
		name="fhOther"
		bind:value={f.otherDetails}
		placeholder="Please describe any other urological or relevant conditions in your family..."
	/>
</SectionCard>
