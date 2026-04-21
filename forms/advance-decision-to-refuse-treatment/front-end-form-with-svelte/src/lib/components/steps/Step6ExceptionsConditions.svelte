<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const e = assessment.data.exceptionsConditions;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Exceptions & Conditions" description="Circumstances where your treatment refusals would NOT apply">
	<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<p class="font-semibold">Guidance</p>
		<p class="mt-1">You may wish to specify circumstances where your refusal of treatment does NOT apply. For example, you might refuse treatment in the case of advanced dementia but not in the case of a temporary illness from which you could recover.</p>
	</div>

	<RadioGroup
		label="Are there any circumstances where your treatment refusals would NOT apply?"
		name="hasExceptions"
		options={yesNo}
		bind:value={e.hasExceptions}
	/>
	{#if e.hasExceptions === 'yes'}
		<TextArea
			label="Describe the exceptions"
			name="exceptionsDescription"
			bind:value={e.exceptionsDescription}
			rows={4}
			placeholder="Describe the circumstances in which your treatment refusals would NOT apply"
		/>
	{/if}

	<RadioGroup
		label="Does this ADRT have any time limitations?"
		name="hasTimeLimitations"
		options={yesNo}
		bind:value={e.hasTimeLimitations}
	/>
	{#if e.hasTimeLimitations === 'yes'}
		<TextArea
			label="Time limitations"
			name="timeLimitationsDescription"
			bind:value={e.timeLimitationsDescription}
			rows={3}
			placeholder="e.g. 'This ADRT is valid for 5 years from the date of signing'"
		/>
	{/if}

	<TextArea
		label="Conditions that would invalidate this ADRT (optional)"
		name="invalidatingConditions"
		bind:value={e.invalidatingConditions}
		rows={3}
		placeholder="e.g. 'This ADRT is invalidated if a new treatment becomes available for my condition'"
	/>
</SectionCard>
