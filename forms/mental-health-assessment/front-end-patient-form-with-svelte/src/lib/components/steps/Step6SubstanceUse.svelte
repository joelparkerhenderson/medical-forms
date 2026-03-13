<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.substanceUse;
</script>

<SectionCard title="Substance Use" description="Alcohol, drug, and tobacco use history">
	<h3 class="mb-3 text-sm font-semibold text-gray-700">Alcohol Use (AUDIT-C)</h3>

	<SelectInput
		label="How often do you have a drink containing alcohol?"
		name="alcoholFrequency"
		options={[
			{ value: 'never', label: 'Never' },
			{ value: 'monthly-or-less', label: 'Monthly or less' },
			{ value: '2-4-per-month', label: '2-4 times per month' },
			{ value: '2-3-per-week', label: '2-3 times per week' },
			{ value: '4-or-more-per-week', label: '4 or more times per week' }
		]}
		bind:value={s.alcoholFrequency}
	/>

	{#if s.alcoholFrequency !== '' && s.alcoholFrequency !== 'never'}
		<SelectInput
			label="How many standard drinks on a typical day when you are drinking?"
			name="alcoholQuantity"
			options={[
				{ value: '1-2', label: '1-2' },
				{ value: '3-4', label: '3-4' },
				{ value: '5-6', label: '5-6' },
				{ value: '7-9', label: '7-9' },
				{ value: '10-or-more', label: '10 or more' }
			]}
			bind:value={s.alcoholQuantity}
		/>

		<SelectInput
			label="How often do you have 6 or more drinks on one occasion?"
			name="bingeDrinking"
			options={[
				{ value: 'never', label: 'Never' },
				{ value: 'less-than-monthly', label: 'Less than monthly' },
				{ value: 'monthly', label: 'Monthly' },
				{ value: 'weekly', label: 'Weekly' },
				{ value: 'daily-or-almost', label: 'Daily or almost daily' }
			]}
			bind:value={s.bingeDrinking}
		/>
	{/if}

	<div class="mt-6 border-t border-gray-200 pt-6">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Drug Use</h3>
		<RadioGroup
			label="Do you use recreational or non-prescribed drugs?"
			name="drugUse"
			options={[
				{ value: 'never', label: 'Never' },
				{ value: 'past', label: 'In the past' },
				{ value: 'occasional', label: 'Occasionally' },
				{ value: 'regular', label: 'Regularly' }
			]}
			bind:value={s.drugUse}
		/>
		{#if s.drugUse !== '' && s.drugUse !== 'never'}
			<TextArea label="Please provide details (types, frequency)" name="drugDetails" bind:value={s.drugDetails} />
		{/if}
	</div>

	<div class="mt-6 border-t border-gray-200 pt-6">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Tobacco</h3>
		<RadioGroup
			label="Do you use tobacco products?"
			name="tobaccoUse"
			options={[
				{ value: 'never', label: 'Never' },
				{ value: 'former', label: 'Former smoker' },
				{ value: 'current', label: 'Current smoker' }
			]}
			bind:value={s.tobaccoUse}
		/>
		{#if s.tobaccoUse === 'current' || s.tobaccoUse === 'former'}
			<TextArea label="Please provide details (amount, duration)" name="tobaccoDetails" bind:value={s.tobaccoDetails} />
		{/if}
	</div>
</SectionCard>
