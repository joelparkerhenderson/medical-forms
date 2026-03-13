<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const m = assessment.data.menopauseStatus;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Menopause Status" description="Current menopausal stage and history">
	<RadioGroup
		label="What is your current menopausal status?"
		name="menopausalStatus"
		options={[
			{ value: 'pre', label: 'Pre-menopausal' },
			{ value: 'peri', label: 'Peri-menopausal' },
			{ value: 'post', label: 'Post-menopausal' }
		]}
		bind:value={m.menopausalStatus}
		required
	/>

	<TextInput label="Date of last menstrual period" name="lmp" type="date" bind:value={m.lastMenstrualPeriod} />

	{#if m.menopausalStatus === 'post'}
		<NumberInput label="Age at menopause" name="ageAtMenopause" bind:value={m.ageAtMenopause} min={20} max={65} />
	{/if}

	<RadioGroup label="Was menopause surgical (e.g., hysterectomy, bilateral oophorectomy)?" name="surgicalMenopause" options={yesNo} bind:value={m.surgicalMenopause} />
	{#if m.surgicalMenopause === 'yes'}
		<TextInput label="Please provide details of the surgery" name="surgicalDetails" bind:value={m.surgicalMenopauseDetails} />
	{/if}

	<RadioGroup label="Have you been diagnosed with premature ovarian insufficiency (POI)?" name="poi" options={yesNo} bind:value={m.prematureOvarianInsufficiency} />
</SectionCard>
