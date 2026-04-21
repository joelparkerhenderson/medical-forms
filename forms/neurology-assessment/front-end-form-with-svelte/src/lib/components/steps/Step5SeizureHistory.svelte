<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.seizureHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Seizure History" description="Seizure type, frequency, and management">
	<RadioGroup label="Do you have a history of seizures?" name="seizureHistory" options={yesNo} bind:value={s.seizureHistory} />

	{#if s.seizureHistory === 'yes'}
		<SelectInput
			label="Seizure type"
			name="seizureType"
			options={[
				{ value: 'focal', label: 'Focal (partial)' },
				{ value: 'generalised-tonic-clonic', label: 'Generalised tonic-clonic' },
				{ value: 'absence', label: 'Absence' },
				{ value: 'myoclonic', label: 'Myoclonic' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={s.seizureType}
		/>

		<TextInput label="Frequency" name="seizureFreq" bind:value={s.frequency} placeholder="e.g., 2 per month, 1 per year" />
		<TextInput label="Date of last seizure" name="lastSeizure" type="date" bind:value={s.lastSeizureDate} />
		<TextArea label="Known triggers" name="seizureTriggers" bind:value={s.triggers} placeholder="e.g., sleep deprivation, alcohol, flashing lights" />

		<RadioGroup label="Do you experience an aura before seizures?" name="seizureAura" options={yesNo} bind:value={s.aura} />
		{#if s.aura === 'yes'}
			<TextArea label="Describe the aura" name="seizureAuraDesc" bind:value={s.auraDescription} />
		{/if}

		<TextArea label="Post-ictal state" name="postIctal" bind:value={s.postIctalState} placeholder="e.g., confusion, drowsiness, duration" />

		<RadioGroup label="History of status epilepticus?" name="statusEpilepticus" options={yesNo} bind:value={s.statusEpilepticus} />
	{/if}
</SectionCard>
