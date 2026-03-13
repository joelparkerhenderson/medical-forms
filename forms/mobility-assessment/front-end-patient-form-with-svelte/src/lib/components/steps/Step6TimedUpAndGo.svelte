<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const t = assessment.data.timedUpAndGo;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Timed Up and Go (TUG)" description="Patient rises from chair, walks 3 metres, turns, walks back, and sits down">
	<NumberInput
		label="Time to Complete"
		name="timeSeconds"
		bind:value={t.timeSeconds}
		min={0}
		max={300}
		step={0.1}
		unit="seconds"
		required
	/>

	<div class="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
		<p class="font-medium">TUG Interpretation:</p>
		<ul class="mt-1 list-disc pl-5 space-y-1">
			<li>&lt;10 seconds: Freely mobile</li>
			<li>10-14 seconds: Mostly independent</li>
			<li>14-20 seconds: Variable mobility</li>
			<li>&gt;20 seconds: Impaired mobility</li>
		</ul>
	</div>

	<div class="mt-4">
		<RadioGroup
			label="Did the patient use an assistive device?"
			name="usedAssistiveDevice"
			options={yesNo}
			bind:value={t.usedAssistiveDevice}
		/>
	</div>

	{#if t.usedAssistiveDevice === 'yes'}
		<TextInput
			label="Device Type"
			name="deviceType"
			bind:value={t.deviceType}
			placeholder="e.g., cane, walker, rollator..."
		/>
	{/if}
</SectionCard>
