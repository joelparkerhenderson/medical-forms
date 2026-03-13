<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const b = assessment.data.balanceAssessment;

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

	let sittingBalance = $state(fromTinettiScore(b.sittingBalance));
	let risesFromChair = $state(fromTinettiScore(b.risesFromChair));
	let attemptingToRise = $state(fromTinettiScore(b.attemptingToRise));
	let immediateStandingBalance = $state(fromTinettiScore(b.immediateStandingBalance));
	let standingBalance = $state(fromTinettiScore(b.standingBalance));
	let nudgedBalance = $state(fromTinettiScore(b.nudgedBalance));
	let eyesClosed = $state(fromTinettiScore(b.eyesClosed));
	let turning360 = $state(fromTinettiScore(b.turning360));
	let sittingDown = $state(fromTinettiScore(b.sittingDown));

	$effect(() => { b.sittingBalance = toTinettiScore(sittingBalance); });
	$effect(() => { b.risesFromChair = toTinettiScore(risesFromChair); });
	$effect(() => { b.attemptingToRise = toTinettiScore(attemptingToRise); });
	$effect(() => { b.immediateStandingBalance = toTinettiScore(immediateStandingBalance); });
	$effect(() => { b.standingBalance = toTinettiScore(standingBalance); });
	$effect(() => { b.nudgedBalance = toTinettiScore(nudgedBalance); });
	$effect(() => { b.eyesClosed = toTinettiScore(eyesClosed); });
	$effect(() => { b.turning360 = toTinettiScore(turning360); });
	$effect(() => { b.sittingDown = toTinettiScore(sittingDown); });
</script>

<SectionCard title="Balance Assessment (Tinetti)" description="Tinetti Balance Test - 9 items, maximum 16 points">
	<div class="space-y-6">
		<RadioGroup
			label="1. Sitting Balance (0 = leans/slides, 1 = steady/safe)"
			name="sittingBalance"
			options={score01}
			bind:value={sittingBalance}
		/>

		<RadioGroup
			label="2. Rises from Chair (0 = unable without help, 1 = uses arms, 2 = without arms)"
			name="risesFromChair"
			options={score02}
			bind:value={risesFromChair}
		/>

		<RadioGroup
			label="3. Attempting to Rise (0 = unable without help, 1 = requires >1 attempt, 2 = first attempt)"
			name="attemptingToRise"
			options={score02}
			bind:value={attemptingToRise}
		/>

		<RadioGroup
			label="4. Immediate Standing Balance (0 = unsteady, 1 = steady with aid, 2 = steady without aid)"
			name="immediateStandingBalance"
			options={score02}
			bind:value={immediateStandingBalance}
		/>

		<RadioGroup
			label="5. Standing Balance (0 = unsteady, 1 = wide stance/uses support, 2 = narrow stance without support)"
			name="standingBalance"
			options={score02}
			bind:value={standingBalance}
		/>

		<RadioGroup
			label="6. Nudged (sternum push x3) (0 = begins to fall, 1 = staggers/grabs, 2 = steady)"
			name="nudgedBalance"
			options={score02}
			bind:value={nudgedBalance}
		/>

		<RadioGroup
			label="7. Eyes Closed (same position) (0 = unsteady, 1 = steady)"
			name="eyesClosed"
			options={score01}
			bind:value={eyesClosed}
		/>

		<RadioGroup
			label="8. Turning 360 degrees (0 = discontinuous/unsteady, 1 = continuous or steady, 2 = continuous and steady)"
			name="turning360"
			options={score02}
			bind:value={turning360}
		/>

		<RadioGroup
			label="9. Sitting Down (0 = unsafe, 1 = uses arms/not smooth, 2 = safe/smooth)"
			name="sittingDown"
			options={score02}
			bind:value={sittingDown}
		/>
	</div>
</SectionCard>
