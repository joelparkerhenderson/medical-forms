<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { formatAge } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.developmentalMilestones;
	const dob = assessment.data.demographics.dateOfBirth;
	const ageDisplay = $derived(formatAge(dob));

	const domainOptions = [
		{ value: 'pass', label: 'Pass' },
		{ value: 'concern', label: 'Concern' },
		{ value: 'fail', label: 'Fail' }
	];
</script>

<SectionCard title="Developmental Milestones" description="Age-appropriate developmental screening across five domains">
	{#if ageDisplay}
		<div class="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
			Child's age: <strong>{ageDisplay}</strong> - assess milestones appropriate for this age.
		</div>
	{/if}

	<div class="space-y-6">
		<div>
			<RadioGroup label="Gross Motor (e.g., sitting, crawling, walking, running)" name="grossMotor" options={domainOptions} bind:value={m.grossMotor} required />
			{#if m.grossMotor === 'concern' || m.grossMotor === 'fail'}
				<TextArea label="Gross motor notes" name="grossMotorNotes" bind:value={m.grossMotorNotes} placeholder="Describe specific milestones not met..." />
			{/if}
		</div>

		<div>
			<RadioGroup label="Fine Motor (e.g., grasping, drawing, writing)" name="fineMotor" options={domainOptions} bind:value={m.fineMotor} required />
			{#if m.fineMotor === 'concern' || m.fineMotor === 'fail'}
				<TextArea label="Fine motor notes" name="fineMotorNotes" bind:value={m.fineMotorNotes} placeholder="Describe specific milestones not met..." />
			{/if}
		</div>

		<div>
			<RadioGroup label="Language (e.g., babbling, first words, sentences)" name="language" options={domainOptions} bind:value={m.language} required />
			{#if m.language === 'concern' || m.language === 'fail'}
				<TextArea label="Language notes" name="languageNotes" bind:value={m.languageNotes} placeholder="Describe specific milestones not met..." />
			{/if}
		</div>

		<div>
			<RadioGroup label="Social-Emotional (e.g., eye contact, social smile, play)" name="socialEmotional" options={domainOptions} bind:value={m.socialEmotional} required />
			{#if m.socialEmotional === 'concern' || m.socialEmotional === 'fail'}
				<TextArea label="Social-emotional notes" name="socialEmotionalNotes" bind:value={m.socialEmotionalNotes} placeholder="Describe specific concerns..." />
			{/if}
		</div>

		<div>
			<RadioGroup label="Cognitive (e.g., problem-solving, memory, attention)" name="cognitive" options={domainOptions} bind:value={m.cognitive} required />
			{#if m.cognitive === 'concern' || m.cognitive === 'fail'}
				<TextArea label="Cognitive notes" name="cognitiveNotes" bind:value={m.cognitiveNotes} placeholder="Describe specific concerns..." />
			{/if}
		</div>
	</div>
</SectionCard>
