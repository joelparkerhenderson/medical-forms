<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const st = assessment.data.strengthTesting;
</script>

<SectionCard title="Strength Testing" description="Grip strength and manual muscle testing results">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Grip Strength - Left"
			name="gripStrengthLeft"
			bind:value={st.gripStrengthLeft}
			min={0}
			max={100}
			unit="kg"
		/>
		<NumberInput
			label="Grip Strength - Right"
			name="gripStrengthRight"
			bind:value={st.gripStrengthRight}
			min={0}
			max={100}
			unit="kg"
		/>
	</div>

	<SelectInput
		label="Manual Muscle Testing Grade"
		name="manualMuscleGrade"
		options={[
			{ value: '0/5', label: '0/5 - No contraction' },
			{ value: '1/5', label: '1/5 - Flicker/trace of contraction' },
			{ value: '2/5', label: '2/5 - Active movement, gravity eliminated' },
			{ value: '3/5', label: '3/5 - Active movement against gravity' },
			{ value: '4/5', label: '4/5 - Active movement against some resistance' },
			{ value: '5/5', label: '5/5 - Normal power' }
		]}
		bind:value={st.manualMuscleGrade}
	/>

	<TextArea
		label="Specific Weaknesses"
		name="specificWeaknesses"
		bind:value={st.specificWeaknesses}
		placeholder="Describe any specific muscle groups showing weakness..."
	/>
</SectionCard>
