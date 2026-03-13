<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const w = assessment.data.workstationSetup;
</script>

<SectionCard title="Workstation Setup" description="Evaluate your workstation configuration">
	<SelectInput
		label="Desk Height"
		name="deskHeight"
		options={[
			{ value: 'too-low', label: 'Too low' },
			{ value: 'correct', label: 'Correct' },
			{ value: 'too-high', label: 'Too high' }
		]}
		bind:value={w.deskHeight}
	/>

	<SelectInput
		label="Chair Type"
		name="chairType"
		options={[
			{ value: 'fixed', label: 'Fixed (non-adjustable)' },
			{ value: 'adjustable', label: 'Adjustable office chair' },
			{ value: 'standing-desk', label: 'Standing desk / stool' },
			{ value: 'other', label: 'Other' }
		]}
		bind:value={w.chairType}
	/>

	<RadioGroup
		label="Is your chair adjustable (height, backrest, armrests)?"
		name="chairAdj"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={w.chairAdjustability}
	/>

	<SelectInput
		label="Monitor Position (distance)"
		name="monitorPos"
		options={[
			{ value: 'too-close', label: 'Too close' },
			{ value: 'correct', label: 'Correct' },
			{ value: 'too-far', label: 'Too far' }
		]}
		bind:value={w.monitorPosition}
	/>

	<SelectInput
		label="Monitor Distance"
		name="monitorDist"
		options={[
			{ value: 'less-than-40cm', label: 'Less than 40cm' },
			{ value: '40-70cm', label: '40-70cm (recommended)' },
			{ value: 'more-than-70cm', label: 'More than 70cm' }
		]}
		bind:value={w.monitorDistance}
	/>

	<SelectInput
		label="Monitor Height"
		name="monitorHeight"
		options={[
			{ value: 'below-eye-level', label: 'Below eye level' },
			{ value: 'at-eye-level', label: 'At eye level (recommended)' },
			{ value: 'above-eye-level', label: 'Above eye level' }
		]}
		bind:value={w.monitorHeight}
	/>

	<SelectInput
		label="Keyboard Placement"
		name="keyboardPlace"
		options={[
			{ value: 'correct', label: 'Correct (elbows at 90 degrees)' },
			{ value: 'too-high', label: 'Too high' },
			{ value: 'too-far', label: 'Too far away' },
			{ value: 'angled-incorrectly', label: 'Angled incorrectly' }
		]}
		bind:value={w.keyboardPlacement}
	/>

	<SelectInput
		label="Mouse Placement"
		name="mousePlace"
		options={[
			{ value: 'beside-keyboard', label: 'Beside keyboard (correct)' },
			{ value: 'too-far', label: 'Too far from keyboard' },
			{ value: 'awkward-reach', label: 'Requires awkward reach' }
		]}
		bind:value={w.mousePlacement}
	/>

	<SelectInput
		label="Lighting"
		name="lighting"
		options={[
			{ value: 'adequate', label: 'Adequate' },
			{ value: 'too-bright', label: 'Too bright' },
			{ value: 'too-dim', label: 'Too dim' },
			{ value: 'glare-present', label: 'Glare on screen' }
		]}
		bind:value={w.lighting}
	/>

	<SelectInput
		label="Temperature"
		name="temperature"
		options={[
			{ value: 'comfortable', label: 'Comfortable' },
			{ value: 'too-hot', label: 'Too hot' },
			{ value: 'too-cold', label: 'Too cold' }
		]}
		bind:value={w.temperature}
	/>
</SectionCard>
