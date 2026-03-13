<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const h = assessment.data.ocularHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Ocular History" description="Previous eye conditions and treatments">
	<RadioGroup label="Any previous eye conditions?" name="prevConditions" options={yesNo} bind:value={h.previousEyeConditions} />
	{#if h.previousEyeConditions === 'yes'}
		<TextArea label="Please provide details" name="prevConditionDetails" bind:value={h.previousEyeConditionDetails} />
	{/if}

	<RadioGroup label="Any previous eye surgery?" name="prevSurgery" options={yesNo} bind:value={h.previousEyeSurgery} />
	{#if h.previousEyeSurgery === 'yes'}
		<TextArea label="Please provide details (type, date, eye)" name="prevSurgeryDetails" bind:value={h.previousEyeSurgeryDetails} />
	{/if}

	<RadioGroup label="Any previous laser treatment?" name="laserTx" options={yesNo} bind:value={h.laserTreatment} />
	{#if h.laserTreatment === 'yes'}
		<TextArea label="Please provide details" name="laserDetails" bind:value={h.laserTreatmentDetails} />
	{/if}

	<RadioGroup label="Any history of eye trauma?" name="trauma" options={yesNo} bind:value={h.ocularTrauma} />
	{#if h.ocularTrauma === 'yes'}
		<TextArea label="Please provide details" name="traumaDetails" bind:value={h.ocularTraumaDetails} />
	{/if}

	<RadioGroup label="Do you have amblyopia (lazy eye)?" name="amblyopia" options={yesNo} bind:value={h.amblyopia} />
	{#if h.amblyopia === 'yes'}
		<RadioGroup
			label="Which eye?"
			name="amblyopiaEye"
			options={[
				{ value: 'left', label: 'Left' },
				{ value: 'right', label: 'Right' },
				{ value: 'both', label: 'Both' }
			]}
			bind:value={h.amblyopiaEye}
		/>
	{/if}
</SectionCard>
