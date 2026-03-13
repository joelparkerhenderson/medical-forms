<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.motorSensoryExam;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const strengthOptions = [
		{ value: '0', label: '0 - No contraction' },
		{ value: '1', label: '1 - Flicker/trace' },
		{ value: '2', label: '2 - Active movement, gravity eliminated' },
		{ value: '3', label: '3 - Active movement against gravity' },
		{ value: '4', label: '4 - Active movement against resistance' },
		{ value: '5', label: '5 - Normal strength' }
	];
</script>

<SectionCard title="Motor & Sensory Examination" description="Strength, tone, reflexes, sensation, coordination, and gait">
	<h3 class="mb-3 font-semibold text-gray-800">Muscle Strength (MRC Scale)</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput label="Upper limb - Left" name="strengthUL" options={strengthOptions} bind:value={m.strengthUpperLeft} />
		<SelectInput label="Upper limb - Right" name="strengthUR" options={strengthOptions} bind:value={m.strengthUpperRight} />
		<SelectInput label="Lower limb - Left" name="strengthLL" options={strengthOptions} bind:value={m.strengthLowerLeft} />
		<SelectInput label="Lower limb - Right" name="strengthLR" options={strengthOptions} bind:value={m.strengthLowerRight} />
	</div>

	<SelectInput
		label="Tone"
		name="tone"
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'increased', label: 'Increased (spasticity/rigidity)' },
			{ value: 'decreased', label: 'Decreased (flaccid)' },
			{ value: 'rigid', label: 'Rigid (lead-pipe/cogwheel)' }
		]}
		bind:value={m.tone}
	/>

	<SelectInput
		label="Reflexes"
		name="reflexes"
		options={[
			{ value: '0', label: '0 - Absent' },
			{ value: '1', label: '1 - Diminished' },
			{ value: '2', label: '2 - Normal' },
			{ value: '3', label: '3 - Brisk' },
			{ value: '4', label: '4 - Clonus' }
		]}
		bind:value={m.reflexes}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Plantar response - Left"
			name="plantarLeft"
			options={[
				{ value: 'flexor', label: 'Flexor (normal)' },
				{ value: 'extensor', label: 'Extensor (Babinski positive)' }
			]}
			bind:value={m.plantarResponseLeft}
		/>
		<SelectInput
			label="Plantar response - Right"
			name="plantarRight"
			options={[
				{ value: 'flexor', label: 'Flexor (normal)' },
				{ value: 'extensor', label: 'Extensor (Babinski positive)' }
			]}
			bind:value={m.plantarResponseRight}
		/>
	</div>

	<SelectInput
		label="Sensation"
		name="sensation"
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'decreased', label: 'Decreased' },
			{ value: 'absent', label: 'Absent' },
			{ value: 'paraesthesia', label: 'Paraesthesia (tingling/pins and needles)' }
		]}
		bind:value={m.sensation}
	/>
	{#if m.sensation !== 'normal' && m.sensation !== ''}
		<TextArea label="Sensory details (distribution)" name="sensationDetails" bind:value={m.sensationDetails} />
	{/if}

	<RadioGroup label="Coordination normal?" name="coordination" options={yesNo} bind:value={m.coordination} />
	{#if m.coordination === 'no'}
		<TextArea label="Coordination details" name="coordDetails" bind:value={m.coordinationDetails} placeholder="e.g., finger-nose, heel-shin abnormalities" />
	{/if}

	<SelectInput
		label="Gait"
		name="gait"
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'ataxic', label: 'Ataxic (unsteady/broad-based)' },
			{ value: 'spastic', label: 'Spastic (stiff/scissoring)' },
			{ value: 'steppage', label: 'Steppage (high-stepping/foot drop)' },
			{ value: 'antalgic', label: 'Antalgic (limping)' },
			{ value: 'unable', label: 'Unable to walk' }
		]}
		bind:value={m.gait}
	/>
</SectionCard>
