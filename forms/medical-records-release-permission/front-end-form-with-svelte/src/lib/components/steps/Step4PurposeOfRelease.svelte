<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { purposeOptions } from '$lib/engine/validation-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.purposeOfRelease;
</script>

<SectionCard title="Purpose of Release" description="Indicate the reason for requesting the release of medical records">
	<RadioGroup
		label="Purpose"
		name="purpose"
		options={purposeOptions}
		bind:value={p.purpose}
		required
	/>

	{#if p.purpose === 'other'}
		<TextArea
			label="Please provide details"
			name="otherDetails"
			bind:value={p.otherDetails}
			placeholder="Describe the purpose of the records release..."
		/>
	{/if}
</SectionCard>
