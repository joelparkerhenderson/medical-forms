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

<SectionCard title="Medical History" description="Previous skin conditions and relevant medical history">
	<TextArea
		label="Previous skin conditions"
		name="previousSkin"
		bind:value={m.previousSkinConditions}
		placeholder="e.g., eczema, psoriasis, acne, rosacea..."
	/>

	<RadioGroup label="Do you have any autoimmune diseases?" name="autoimmune" options={yesNo} bind:value={m.autoimmuneDiseases} />
	{#if m.autoimmuneDiseases === 'yes'}
		<TextArea label="Please provide details" name="autoimmuneDetails" bind:value={m.autoimmuneDiseaseDetails} />
	{/if}

	<RadioGroup label="Are you immunosuppressed or on immunosuppressive therapy?" name="immunosuppression" options={yesNo} bind:value={m.immunosuppression} />
	{#if m.immunosuppression === 'yes'}
		<TextArea label="Please provide details" name="immunoDetails" bind:value={m.immunosuppressionDetails} />
	{/if}

	<RadioGroup label="Do you have a history of cancer?" name="cancerHistory" options={yesNo} bind:value={m.cancerHistory} />
	{#if m.cancerHistory === 'yes'}
		<TextArea label="Please provide details (type, treatment, current status)" name="cancerDetails" bind:value={m.cancerHistoryDetails} />
	{/if}
</SectionCard>
