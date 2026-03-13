<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const fp = assessment.data.facialPalsy;
</script>

<SectionCard title="Facial Palsy & Motor" description="NIHSS Items 4, 5a, 5b, 6a, 6b">
	<RadioGroup
		label="4. Facial Palsy"
		name="facialPalsy"
		options={[
			{ value: '0', label: '0 - Normal symmetrical movements' },
			{ value: '1', label: '1 - Minor paralysis (flattened nasolabial fold)' },
			{ value: '2', label: '2 - Partial paralysis (lower face)' },
			{ value: '3', label: '3 - Complete paralysis (upper and lower face)' }
		]}
		bind:value={fp.facialPalsy as any}
		required
	/>

	<RadioGroup
		label="5a. Motor Arm - Left (hold at 90 degrees for 10 seconds)"
		name="leftArm"
		options={[
			{ value: '0', label: '0 - No drift; holds limb for full 10 seconds' },
			{ value: '1', label: '1 - Drift; holds limb but drifts before 10 seconds' },
			{ value: '2', label: '2 - Some effort against gravity' },
			{ value: '3', label: '3 - No effort against gravity; limb falls' },
			{ value: '4', label: '4 - No movement' }
		]}
		bind:value={fp.leftArm as any}
		required
	/>

	<RadioGroup
		label="5b. Motor Arm - Right (hold at 90 degrees for 10 seconds)"
		name="rightArm"
		options={[
			{ value: '0', label: '0 - No drift; holds limb for full 10 seconds' },
			{ value: '1', label: '1 - Drift; holds limb but drifts before 10 seconds' },
			{ value: '2', label: '2 - Some effort against gravity' },
			{ value: '3', label: '3 - No effort against gravity; limb falls' },
			{ value: '4', label: '4 - No movement' }
		]}
		bind:value={fp.rightArm as any}
		required
	/>

	<RadioGroup
		label="6a. Motor Leg - Left (hold at 30 degrees for 5 seconds)"
		name="leftLeg"
		options={[
			{ value: '0', label: '0 - No drift; holds limb for full 5 seconds' },
			{ value: '1', label: '1 - Drift; holds limb but drifts before 5 seconds' },
			{ value: '2', label: '2 - Some effort against gravity' },
			{ value: '3', label: '3 - No effort against gravity; limb falls' },
			{ value: '4', label: '4 - No movement' }
		]}
		bind:value={fp.leftLeg as any}
		required
	/>

	<RadioGroup
		label="6b. Motor Leg - Right (hold at 30 degrees for 5 seconds)"
		name="rightLeg"
		options={[
			{ value: '0', label: '0 - No drift; holds limb for full 5 seconds' },
			{ value: '1', label: '1 - Drift; holds limb but drifts before 5 seconds' },
			{ value: '2', label: '2 - Some effort against gravity' },
			{ value: '3', label: '3 - No effort against gravity; limb falls' },
			{ value: '4', label: '4 - No movement' }
		]}
		bind:value={fp.rightLeg as any}
		required
	/>
</SectionCard>
