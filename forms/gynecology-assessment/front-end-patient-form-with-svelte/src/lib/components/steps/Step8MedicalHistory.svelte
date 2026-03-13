<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.medicalHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="Previous gynaecological conditions and relevant medical history">
	<TextArea
		label="Previous gynaecological conditions"
		name="previousGynConditions"
		bind:value={m.previousGynConditions}
		placeholder="e.g., endometriosis, fibroids, ovarian cysts, PCOS..."
	/>

	<TextArea
		label="Chronic diseases"
		name="chronicDiseases"
		bind:value={m.chronicDiseases}
		placeholder="e.g., diabetes, hypertension, thyroid disease..."
	/>

	<TextArea
		label="Surgical history"
		name="surgicalHistory"
		bind:value={m.surgicalHistory}
		placeholder="e.g., laparoscopy, hysteroscopy, caesarean section..."
	/>

	<RadioGroup label="Do you have any autoimmune diseases?" name="autoimmune" options={yesNo} bind:value={m.autoimmuneDiseases} />
	{#if m.autoimmuneDiseases === 'yes'}
		<TextArea label="Please provide details" name="autoimmuneDetails" bind:value={m.autoimmuneDiseaseDetails} />
	{/if}
</SectionCard>
