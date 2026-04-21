<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const t = assessment.data.tinnitusAssessment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Tinnitus Assessment" description="Ringing, buzzing, or other sounds in the ears">
	<RadioGroup label="Do you experience tinnitus (ringing, buzzing, or other sounds in your ears)?" name="tinnitusPresence" options={yesNo} bind:value={t.presence} />

	{#if t.presence === 'yes'}
		<RadioGroup
			label="Which ear is affected?"
			name="tinnitusEar"
			options={[
				{ value: 'left', label: 'Left' },
				{ value: 'right', label: 'Right' },
				{ value: 'both', label: 'Both' }
			]}
			bind:value={t.affectedEar}
		/>

		<SelectInput
			label="What does the tinnitus sound like?"
			name="tinnitusCharacter"
			options={[
				{ value: 'ringing', label: 'Ringing' },
				{ value: 'buzzing', label: 'Buzzing' },
				{ value: 'hissing', label: 'Hissing' },
				{ value: 'pulsatile', label: 'Pulsatile (heartbeat-like)' },
				{ value: 'clicking', label: 'Clicking' },
				{ value: 'roaring', label: 'Roaring' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={t.character}
		/>

		<RadioGroup
			label="How severe is the tinnitus?"
			name="tinnitusSeverity"
			options={[
				{ value: 'mild', label: 'Mild' },
				{ value: 'moderate', label: 'Moderate' },
				{ value: 'severe', label: 'Severe' }
			]}
			bind:value={t.severity}
		/>

		<TextInput
			label="How long have you had tinnitus?"
			name="tinnitusDuration"
			bind:value={t.duration}
			placeholder="e.g., 3 months, 5 years"
		/>

		<RadioGroup
			label="How much does tinnitus impact your daily life?"
			name="tinnitusImpact"
			options={[
				{ value: 'mild', label: 'Mild - barely noticeable' },
				{ value: 'moderate', label: 'Moderate - noticeable but manageable' },
				{ value: 'severe', label: 'Severe - significantly affects daily activities' }
			]}
			bind:value={t.impactOnDailyLife}
		/>

		<NumberInput
			label="Tinnitus Handicap Inventory (THI) Score"
			name="thiScore"
			bind:value={t.tinnitusHandicapInventoryScore}
			min={0}
			max={100}
			unit="0-100"
		/>
	{/if}
</SectionCard>
