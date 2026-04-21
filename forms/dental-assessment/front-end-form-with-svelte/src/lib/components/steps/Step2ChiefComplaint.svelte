<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const c = assessment.data.chiefComplaint;
</script>

<SectionCard title="Chief Complaint" description="Primary dental concern and pain assessment">
	<TextArea
		label="What is your primary dental concern?"
		name="primaryConcern"
		bind:value={c.primaryConcern}
		placeholder="e.g. Toothache, broken tooth, routine check-up"
	/>

	<TextInput label="Pain location (if any)" name="painLocation" bind:value={c.painLocation} placeholder="e.g. Lower right molar" />

	<NumberInput
		label="Pain severity"
		name="painSeverity"
		bind:value={c.painSeverity}
		min={0}
		max={10}
		unit="0-10 scale"
	/>

	<TextInput label="When did the pain start?" name="painOnset" bind:value={c.painOnset} placeholder="e.g. 3 days ago" />

	<TextInput label="How long does the pain last?" name="painDuration" bind:value={c.painDuration} placeholder="e.g. Constant, intermittent, only when eating" />
</SectionCard>
