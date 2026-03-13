<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const t = assessment.data.treatmentHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Treatment History" description="Previous oncology treatments received">
	<RadioGroup label="Previous surgery for this cancer?" name="prevSurgery" options={yesNo} bind:value={t.previousSurgery} />
	{#if t.previousSurgery === 'yes'}
		<TextArea label="Surgery details" name="surgeryDetails" bind:value={t.surgeryDetails} placeholder="Type of surgery, date, outcome" />
	{/if}

	<RadioGroup label="Previous chemotherapy?" name="prevChemo" options={yesNo} bind:value={t.previousChemotherapy} />
	{#if t.previousChemotherapy === 'yes'}
		<TextArea label="Chemotherapy regimens" name="chemoRegimens" bind:value={t.chemotherapyRegimens} placeholder="e.g., AC-T, FOLFOX, Cisplatin/Etoposide" />
	{/if}

	<RadioGroup label="Previous radiation therapy?" name="prevRadiation" options={yesNo} bind:value={t.previousRadiation} />
	{#if t.previousRadiation === 'yes'}
		<TextArea label="Radiation details" name="radiationDetails" bind:value={t.radiationDetails} placeholder="Site, dose, fractions" />
	{/if}

	<RadioGroup label="Previous immunotherapy?" name="prevImmuno" options={yesNo} bind:value={t.previousImmunotherapy} />
	{#if t.previousImmunotherapy === 'yes'}
		<TextArea label="Immunotherapy details" name="immunoDetails" bind:value={t.immunotherapyDetails} placeholder="e.g., Pembrolizumab, Nivolumab" />
	{/if}

	<RadioGroup label="Previous targeted therapy?" name="prevTargeted" options={yesNo} bind:value={t.previousTargetedTherapy} />
	{#if t.previousTargetedTherapy === 'yes'}
		<TextArea label="Targeted therapy details" name="targetedDetails" bind:value={t.targetedTherapyDetails} placeholder="e.g., Trastuzumab, Imatinib" />
	{/if}

	<RadioGroup label="Clinical trial participation?" name="clinicalTrial" options={yesNo} bind:value={t.clinicalTrialParticipation} />
	{#if t.clinicalTrialParticipation === 'yes'}
		<TextArea label="Clinical trial details" name="trialDetails" bind:value={t.clinicalTrialDetails} placeholder="Trial name, phase, status" />
	{/if}
</SectionCard>
