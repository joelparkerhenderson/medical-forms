<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const eg = assessment.data.expectationsGoals;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Expectations & Goals" description="Your goals and expectations for hearing aids">
	<TextArea
		label="What is your primary goal for hearing improvement?"
		name="primaryGoal"
		bind:value={eg.primaryGoal}
		placeholder="e.g., better conversation with family, hearing TV clearly, phone calls..."
	/>

	<RadioGroup
		label="Do you have realistic expectations about what hearing aids can achieve?"
		name="realisticExpectations"
		options={yesNo}
		bind:value={eg.realisticExpectations}
	/>

	<RadioGroup
		label="How willing are you to wear hearing aids daily?"
		name="willingnessToWear"
		options={[
			{ value: 'very-willing', label: 'Very willing' },
			{ value: 'willing', label: 'Willing' },
			{ value: 'uncertain', label: 'Uncertain' },
			{ value: 'reluctant', label: 'Reluctant' }
		]}
		bind:value={eg.willingnessToWear}
	/>

	<RadioGroup
		label="Do you have concerns about the cost of hearing aids?"
		name="budgetConcerns"
		options={[
			{ value: 'none', label: 'No concerns' },
			{ value: 'mild', label: 'Mild concerns' },
			{ value: 'moderate', label: 'Moderate concerns' },
			{ value: 'significant', label: 'Significant concerns' }
		]}
		bind:value={eg.budgetConcerns}
	/>

	<RadioGroup
		label="Do you have concerns about the cosmetic appearance of hearing aids?"
		name="cosmeticConcerns"
		options={[
			{ value: 'none', label: 'No concerns' },
			{ value: 'mild', label: 'Mild concerns' },
			{ value: 'moderate', label: 'Moderate concerns' },
			{ value: 'significant', label: 'Significant concerns' }
		]}
		bind:value={eg.cosmeticConcerns}
	/>
</SectionCard>
