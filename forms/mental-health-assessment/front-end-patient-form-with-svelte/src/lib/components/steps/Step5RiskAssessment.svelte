<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const r = assessment.data.riskAssessment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Risk Assessment" description="These questions help us understand your safety needs. Please answer honestly.">
	<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<strong>Important:</strong> If you are in immediate danger, please call emergency services (999/911) or go to your nearest emergency department.
	</div>

	<RadioGroup
		label="Have you had any thoughts of suicide or wanting to die?"
		name="suicidalIdeation"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'passive', label: 'Passive thoughts (e.g., wishing to not wake up)' },
			{ value: 'active-no-plan', label: 'Active thoughts, no specific plan' },
			{ value: 'active-with-plan', label: 'Active thoughts with a specific plan' }
		]}
		bind:value={r.suicidalIdeation}
	/>
	{#if r.suicidalIdeation !== '' && r.suicidalIdeation !== 'none'}
		<TextArea label="Please provide more details" name="siDetails" bind:value={r.suicidalIdeationDetails} />
	{/if}

	<RadioGroup
		label="Have you engaged in any self-harm?"
		name="selfHarm"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'past', label: 'In the past, but not currently' },
			{ value: 'current', label: 'Currently' }
		]}
		bind:value={r.selfHarm}
	/>
	{#if r.selfHarm !== '' && r.selfHarm !== 'none'}
		<TextArea label="Please provide more details" name="shDetails" bind:value={r.selfHarmDetails} />
	{/if}

	<RadioGroup
		label="Have you had thoughts of harming others?"
		name="harmToOthers"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'thoughts', label: 'Thoughts, but no intent' },
			{ value: 'intent', label: 'Thoughts with intent' }
		]}
		bind:value={r.harmToOthers}
	/>
	{#if r.harmToOthers !== '' && r.harmToOthers !== 'none'}
		<TextArea label="Please provide more details" name="hoDetails" bind:value={r.harmToOthersDetails} />
	{/if}

	{#if r.suicidalIdeation !== '' && r.suicidalIdeation !== 'none'}
		<RadioGroup
			label="Do you have a safety plan in place?"
			name="safetyPlan"
			options={yesNo}
			bind:value={r.hasSafetyPlan}
		/>
		{#if r.hasSafetyPlan === 'yes'}
			<TextArea label="Please describe your safety plan" name="safetyPlanDetails" bind:value={r.safetyPlanDetails} />
		{/if}
	{/if}
</SectionCard>
