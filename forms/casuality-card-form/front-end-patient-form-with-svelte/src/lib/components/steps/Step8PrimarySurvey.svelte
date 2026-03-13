<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const ps = casualtyCard.data.primarySurvey;

	const gcsTotal = $derived(
		(ps.disability.gcsEye ?? 0) + (ps.disability.gcsVerbal ?? 0) + (ps.disability.gcsMotor ?? 0) || null
	);

	$effect(() => {
		ps.disability.gcsTotal = gcsTotal;
	});
</script>

<SectionCard title="Primary Survey (ABCDE)" description="Systematic ABCDE assessment">
	<!-- Airway -->
	<h3 class="mb-3 text-lg font-semibold text-gray-800">A — Airway</h3>
	<SelectInput
		label="Airway Status"
		name="airwayStatus"
		bind:value={ps.airway.status}
		options={[
			{ value: 'patent', label: 'Patent' },
			{ value: 'compromised', label: 'Compromised' },
			{ value: 'obstructed', label: 'Obstructed' }
		]}
	/>
	<TextInput label="Adjuncts Used" name="airwayAdjuncts" bind:value={ps.airway.adjuncts} placeholder="e.g. OPA, NPA, LMA" />
	<RadioGroup
		label="C-Spine Immobilised?"
		name="cSpineImmobilised"
		bind:value={ps.airway.cSpineImmobilised}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>

	<hr class="my-6 border-gray-200" />

	<!-- Breathing -->
	<h3 class="mb-3 text-lg font-semibold text-gray-800">B — Breathing</h3>
	<SelectInput
		label="Breathing Effort"
		name="breathingEffort"
		bind:value={ps.breathing.effort}
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'laboured', label: 'Laboured' },
			{ value: 'shallow', label: 'Shallow' },
			{ value: 'absent', label: 'Absent' }
		]}
	/>
	<TextInput label="Chest Movement" name="chestMovement" bind:value={ps.breathing.chestMovement} placeholder="e.g. bilateral, equal" />
	<TextInput label="Breath Sounds" name="breathSounds" bind:value={ps.breathing.breathSounds} placeholder="e.g. clear, wheeze, crackles" />
	<TextInput label="Trachea Position" name="tracheaPosition" bind:value={ps.breathing.tracheaPosition} placeholder="e.g. central, deviated" />

	<hr class="my-6 border-gray-200" />

	<!-- Circulation -->
	<h3 class="mb-3 text-lg font-semibold text-gray-800">C — Circulation</h3>
	<TextInput label="Pulse Character" name="pulseCharacter" bind:value={ps.circulation.pulseCharacter} placeholder="e.g. regular, strong" />
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Skin Colour" name="skinColour" bind:value={ps.circulation.skinColour} placeholder="e.g. normal, pale, cyanosed" />
		<TextInput label="Skin Temperature" name="skinTemperature" bind:value={ps.circulation.skinTemperature} placeholder="e.g. warm, cool, clammy" />
	</div>
	<TextInput label="Capillary Refill" name="capillaryRefill" bind:value={ps.circulation.capillaryRefill} placeholder="e.g. < 2 seconds" />
	<TextArea label="Haemorrhage" name="haemorrhage" bind:value={ps.circulation.haemorrhage} placeholder="Describe any bleeding" rows={2} />
	<TextInput label="IV Access" name="ivAccess" bind:value={ps.circulation.ivAccess} placeholder="e.g. 18G left ACF" />

	<hr class="my-6 border-gray-200" />

	<!-- Disability -->
	<h3 class="mb-3 text-lg font-semibold text-gray-800">D — Disability</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
		<NumberInput label="GCS Eye (1-4)" name="gcsEye" bind:value={ps.disability.gcsEye} min={1} max={4} />
		<NumberInput label="GCS Verbal (1-5)" name="gcsVerbal" bind:value={ps.disability.gcsVerbal} min={1} max={5} />
		<NumberInput label="GCS Motor (1-6)" name="gcsMotor" bind:value={ps.disability.gcsMotor} min={1} max={6} />
	</div>
	{#if gcsTotal !== null}
		<div class="mb-4 rounded-lg bg-gray-50 p-3 text-sm">
			<span class="font-medium">GCS Total:</span> {gcsTotal}/15
			{#if gcsTotal <= 8}
				<span class="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Unconscious — consider airway</span>
			{/if}
		</div>
	{/if}
	<TextInput label="Pupils" name="disabilityPupils" bind:value={ps.disability.pupils} placeholder="e.g. equal and reactive" />
	<TextInput label="Blood Glucose" name="disabilityBloodGlucose" bind:value={ps.disability.bloodGlucose} placeholder="e.g. 5.5 mmol/L" />
	<TextInput label="Limb Movements" name="limbMovements" bind:value={ps.disability.limbMovements} placeholder="e.g. all limbs moving" />

	<hr class="my-6 border-gray-200" />

	<!-- Exposure -->
	<h3 class="mb-3 text-lg font-semibold text-gray-800">E — Exposure</h3>
	<TextArea label="Skin Examination" name="skinExamination" bind:value={ps.exposure.skinExamination} rows={2} />
	<TextArea label="Injuries Identified" name="injuriesIdentified" bind:value={ps.exposure.injuriesIdentified} rows={2} />
	<TextArea label="Log Roll Findings" name="logRollFindings" bind:value={ps.exposure.logRollFindings} rows={2} />
</SectionCard>
