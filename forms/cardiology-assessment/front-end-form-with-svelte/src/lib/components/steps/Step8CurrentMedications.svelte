<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.currentMedications;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Current Medications" description="Antiplatelets, anticoagulants, beta-blockers, ACEi/ARBs, statins, diuretics">
	<RadioGroup label="Are you taking antiplatelets (e.g. aspirin, clopidogrel)?" name="antiplatelets" options={yesNo} bind:value={m.antiplatelets} />
	{#if m.antiplatelets === 'yes'}
		<TextInput label="Antiplatelet medication and dose" name="antiplateletType" bind:value={m.antiplateletType} placeholder="e.g. Aspirin 75mg, Clopidogrel 75mg" />
	{/if}

	<RadioGroup label="Are you taking anticoagulants (e.g. warfarin, apixaban)?" name="anticoagulants" options={yesNo} bind:value={m.anticoagulants} />
	{#if m.anticoagulants === 'yes'}
		<TextInput label="Anticoagulant medication and dose" name="anticoagulantType" bind:value={m.anticoagulantType} placeholder="e.g. Warfarin, Apixaban 5mg BD" />
	{/if}

	<RadioGroup label="Are you taking beta-blockers?" name="betaBlockers" options={yesNo} bind:value={m.betaBlockers} />
	{#if m.betaBlockers === 'yes'}
		<TextInput label="Beta-blocker medication and dose" name="betaBlockerType" bind:value={m.betaBlockerType} placeholder="e.g. Bisoprolol 5mg OD" />
	{/if}

	<RadioGroup label="Are you taking ACE inhibitors or ARBs?" name="aceArbs" options={yesNo} bind:value={m.aceInhibitorsARBs} />
	{#if m.aceInhibitorsARBs === 'yes'}
		<TextInput label="ACEi/ARB medication and dose" name="aceArbType" bind:value={m.aceArbType} placeholder="e.g. Ramipril 5mg, Losartan 50mg" />
	{/if}

	<RadioGroup label="Are you taking statins?" name="statins" options={yesNo} bind:value={m.statins} />
	{#if m.statins === 'yes'}
		<TextInput label="Statin medication and dose" name="statinType" bind:value={m.statinType} placeholder="e.g. Atorvastatin 40mg" />
	{/if}

	<RadioGroup label="Are you taking diuretics?" name="diuretics" options={yesNo} bind:value={m.diuretics} />
	{#if m.diuretics === 'yes'}
		<TextInput label="Diuretic medication and dose" name="diureticType" bind:value={m.diureticType} placeholder="e.g. Furosemide 40mg" />
	{/if}

	<TextArea label="Other cardiac medications" name="otherCardiacMeds" bind:value={m.otherCardiacMeds} placeholder="List any other cardiac medications" />
</SectionCard>
