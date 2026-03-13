<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const n = assessment.data.nihssAssessment;

	function handleSelect(field: string, e: string) {
		const val = e === '' ? null : Number(e);
		(assessment.data.nihssAssessment as any)[field] = val;
	}

	function fieldValue(val: number | null): string {
		return val === null ? '' : String(val);
	}
</script>

<SectionCard title="NIHSS Assessment" description="National Institutes of Health Stroke Scale (0-42)">
	<p class="mb-4 text-sm text-gray-500">Score each item. Higher scores indicate greater neurological deficit.</p>

	<SelectInput
		label="1a. Level of Consciousness"
		name="consciousness"
		options={[
			{ value: '0', label: '0 - Alert' },
			{ value: '1', label: '1 - Not alert, arousable' },
			{ value: '2', label: '2 - Not alert, requires repeated stimulation' },
			{ value: '3', label: '3 - Unresponsive' }
		]}
		value={fieldValue(n.consciousness)}
		onchange={(e) => handleSelect('consciousness', e)}
	/>

	<SelectInput
		label="1b. LOC Questions (month, age)"
		name="consciousnessQuestions"
		options={[
			{ value: '0', label: '0 - Both correct' },
			{ value: '1', label: '1 - One correct' },
			{ value: '2', label: '2 - Neither correct' }
		]}
		value={fieldValue(n.consciousnessQuestions)}
		onchange={(e) => handleSelect('consciousnessQuestions', e)}
	/>

	<SelectInput
		label="1c. LOC Commands (open/close eyes, grip/release)"
		name="consciousnessCommands"
		options={[
			{ value: '0', label: '0 - Both correct' },
			{ value: '1', label: '1 - One correct' },
			{ value: '2', label: '2 - Neither correct' }
		]}
		value={fieldValue(n.consciousnessCommands)}
		onchange={(e) => handleSelect('consciousnessCommands', e)}
	/>

	<SelectInput
		label="2. Best Gaze"
		name="gaze"
		options={[
			{ value: '0', label: '0 - Normal' },
			{ value: '1', label: '1 - Partial gaze palsy' },
			{ value: '2', label: '2 - Forced deviation' }
		]}
		value={fieldValue(n.gaze)}
		onchange={(e) => handleSelect('gaze', e)}
	/>

	<SelectInput
		label="3. Visual Fields"
		name="visual"
		options={[
			{ value: '0', label: '0 - No visual loss' },
			{ value: '1', label: '1 - Partial hemianopia' },
			{ value: '2', label: '2 - Complete hemianopia' },
			{ value: '3', label: '3 - Bilateral hemianopia (blind)' }
		]}
		value={fieldValue(n.visual)}
		onchange={(e) => handleSelect('visual', e)}
	/>

	<SelectInput
		label="4. Facial Palsy"
		name="facialPalsy"
		options={[
			{ value: '0', label: '0 - Normal' },
			{ value: '1', label: '1 - Minor paralysis' },
			{ value: '2', label: '2 - Partial paralysis' },
			{ value: '3', label: '3 - Complete paralysis' }
		]}
		value={fieldValue(n.facialPalsy)}
		onchange={(e) => handleSelect('facialPalsy', e)}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="5a. Motor Arm - Left"
			name="motorLeftArm"
			options={[
				{ value: '0', label: '0 - No drift' },
				{ value: '1', label: '1 - Drift before 10 seconds' },
				{ value: '2', label: '2 - Falls before 10 seconds' },
				{ value: '3', label: '3 - No effort against gravity' },
				{ value: '4', label: '4 - No movement' }
			]}
			value={fieldValue(n.motorLeftArm)}
			onchange={(e) => handleSelect('motorLeftArm', e)}
		/>
		<SelectInput
			label="5b. Motor Arm - Right"
			name="motorRightArm"
			options={[
				{ value: '0', label: '0 - No drift' },
				{ value: '1', label: '1 - Drift before 10 seconds' },
				{ value: '2', label: '2 - Falls before 10 seconds' },
				{ value: '3', label: '3 - No effort against gravity' },
				{ value: '4', label: '4 - No movement' }
			]}
			value={fieldValue(n.motorRightArm)}
			onchange={(e) => handleSelect('motorRightArm', e)}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="6a. Motor Leg - Left"
			name="motorLeftLeg"
			options={[
				{ value: '0', label: '0 - No drift' },
				{ value: '1', label: '1 - Drift before 5 seconds' },
				{ value: '2', label: '2 - Falls before 5 seconds' },
				{ value: '3', label: '3 - No effort against gravity' },
				{ value: '4', label: '4 - No movement' }
			]}
			value={fieldValue(n.motorLeftLeg)}
			onchange={(e) => handleSelect('motorLeftLeg', e)}
		/>
		<SelectInput
			label="6b. Motor Leg - Right"
			name="motorRightLeg"
			options={[
				{ value: '0', label: '0 - No drift' },
				{ value: '1', label: '1 - Drift before 5 seconds' },
				{ value: '2', label: '2 - Falls before 5 seconds' },
				{ value: '3', label: '3 - No effort against gravity' },
				{ value: '4', label: '4 - No movement' }
			]}
			value={fieldValue(n.motorRightLeg)}
			onchange={(e) => handleSelect('motorRightLeg', e)}
		/>
	</div>

	<SelectInput
		label="7. Limb Ataxia"
		name="limbAtaxia"
		options={[
			{ value: '0', label: '0 - Absent' },
			{ value: '1', label: '1 - Present in one limb' },
			{ value: '2', label: '2 - Present in two limbs' }
		]}
		value={fieldValue(n.limbAtaxia)}
		onchange={(e) => handleSelect('limbAtaxia', e)}
	/>

	<SelectInput
		label="8. Sensory"
		name="sensory"
		options={[
			{ value: '0', label: '0 - Normal' },
			{ value: '1', label: '1 - Mild-to-moderate loss' },
			{ value: '2', label: '2 - Severe or total loss' }
		]}
		value={fieldValue(n.sensory)}
		onchange={(e) => handleSelect('sensory', e)}
	/>

	<SelectInput
		label="9. Best Language"
		name="language"
		options={[
			{ value: '0', label: '0 - Normal' },
			{ value: '1', label: '1 - Mild-to-moderate aphasia' },
			{ value: '2', label: '2 - Severe aphasia' },
			{ value: '3', label: '3 - Mute/global aphasia' }
		]}
		value={fieldValue(n.language)}
		onchange={(e) => handleSelect('language', e)}
	/>

	<SelectInput
		label="10. Dysarthria"
		name="dysarthria"
		options={[
			{ value: '0', label: '0 - Normal' },
			{ value: '1', label: '1 - Mild-to-moderate' },
			{ value: '2', label: '2 - Severe/unintelligible/mute' }
		]}
		value={fieldValue(n.dysarthria)}
		onchange={(e) => handleSelect('dysarthria', e)}
	/>

	<SelectInput
		label="11. Extinction and Inattention"
		name="extinctionInattention"
		options={[
			{ value: '0', label: '0 - No abnormality' },
			{ value: '1', label: '1 - Inattention to one modality' },
			{ value: '2', label: '2 - Profound neglect in more than one modality' }
		]}
		value={fieldValue(n.extinctionInattention)}
		onchange={(e) => handleSelect('extinctionInattention', e)}
	/>
</SectionCard>
