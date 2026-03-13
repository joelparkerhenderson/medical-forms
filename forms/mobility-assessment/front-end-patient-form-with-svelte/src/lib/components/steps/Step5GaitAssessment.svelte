<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const g = assessment.data.gaitAssessment;

	const score01 = [
		{ value: '0', label: '0' },
		{ value: '1', label: '1' }
	];

	const score02 = [
		{ value: '0', label: '0' },
		{ value: '1', label: '1' },
		{ value: '2', label: '2' }
	];

	function toTinettiScore(val: string): 0 | 1 | 2 | null {
		if (val === '') return null;
		return Number(val) as 0 | 1 | 2;
	}

	function fromTinettiScore(val: 0 | 1 | 2 | null): string {
		return val === null ? '' : String(val);
	}

	let initiationOfGait = $state(fromTinettiScore(g.initiationOfGait));
	let stepLength = $state(fromTinettiScore(g.stepLength));
	let stepHeight = $state(fromTinettiScore(g.stepHeight));
	let stepSymmetry = $state(fromTinettiScore(g.stepSymmetry));
	let stepContinuity = $state(fromTinettiScore(g.stepContinuity));
	let path = $state(fromTinettiScore(g.path));
	let trunk = $state(fromTinettiScore(g.trunk));
	let walkingStance = $state(fromTinettiScore(g.walkingStance));

	$effect(() => { g.initiationOfGait = toTinettiScore(initiationOfGait); });
	$effect(() => { g.stepLength = toTinettiScore(stepLength); });
	$effect(() => { g.stepHeight = toTinettiScore(stepHeight); });
	$effect(() => { g.stepSymmetry = toTinettiScore(stepSymmetry); });
	$effect(() => { g.stepContinuity = toTinettiScore(stepContinuity); });
	$effect(() => { g.path = toTinettiScore(path); });
	$effect(() => { g.trunk = toTinettiScore(trunk); });
	$effect(() => { g.walkingStance = toTinettiScore(walkingStance); });
</script>

<SectionCard title="Gait Assessment (Tinetti)" description="Tinetti Gait Test - 8 items, maximum 12 points">
	<div class="space-y-6">
		<RadioGroup
			label="1. Initiation of Gait (0 = hesitancy/multiple attempts, 1 = no hesitancy)"
			name="initiationOfGait"
			options={score01}
			bind:value={initiationOfGait}
		/>

		<RadioGroup
			label="2. Step Length (right foot passes left) (0 = does not pass, 1 = passes)"
			name="stepLength"
			options={score01}
			bind:value={stepLength}
		/>

		<RadioGroup
			label="3. Step Height (right foot clears floor) (0 = does not clear, 1 = clears)"
			name="stepHeight"
			options={score01}
			bind:value={stepHeight}
		/>

		<RadioGroup
			label="4. Step Symmetry (0 = unequal, 1 = equal)"
			name="stepSymmetry"
			options={score01}
			bind:value={stepSymmetry}
		/>

		<RadioGroup
			label="5. Step Continuity (0 = stopping/discontinuity, 1 = continuous)"
			name="stepContinuity"
			options={score01}
			bind:value={stepContinuity}
		/>

		<RadioGroup
			label="6. Path (over 10 feet) (0 = marked deviation, 1 = mild deviation/uses aid, 2 = straight without aid)"
			name="path"
			options={score02}
			bind:value={path}
		/>

		<RadioGroup
			label="7. Trunk (0 = marked sway/uses aid, 1 = no sway but flexion/arms spread, 2 = no sway/flexion/arm spread)"
			name="trunk"
			options={score02}
			bind:value={trunk}
		/>

		<RadioGroup
			label="8. Walking Stance (0 = heels apart, 1 = heels almost touching)"
			name="walkingStance"
			options={score01}
			bind:value={walkingStance}
		/>
	</div>
</SectionCard>
