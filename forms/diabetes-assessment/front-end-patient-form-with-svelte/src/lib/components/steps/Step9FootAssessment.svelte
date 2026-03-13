<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.footAssessment;
</script>

<SectionCard title="Foot Assessment" description="Comprehensive diabetic foot examination findings.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Foot Pulses"
			name="footPulses"
			bind:value={d.footPulses}
			options={[
				{ value: 'present', label: 'Present' },
				{ value: 'reduced', label: 'Reduced' },
				{ value: 'absent', label: 'Absent' }
			]}
		/>
		<SelectInput
			label="10g Monofilament Test"
			name="monofilamentTest"
			bind:value={d.monofilamentTest}
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'abnormal', label: 'Abnormal' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Vibration Sense (128Hz tuning fork)"
			name="vibrationSense"
			bind:value={d.vibrationSense}
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'reduced', label: 'Reduced' },
				{ value: 'absent', label: 'Absent' }
			]}
		/>
		<RadioGroup
			label="Foot Deformity"
			name="footDeformity"
			bind:value={d.footDeformity}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Callus Present"
			name="callusPresent"
			bind:value={d.callusPresent}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
		<RadioGroup
			label="Ulcer Present"
			name="ulcerPresent"
			bind:value={d.ulcerPresent}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Previous Amputation"
			name="previousAmputation"
			bind:value={d.previousAmputation}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
		<SelectInput
			label="Foot Risk Category"
			name="footRiskCategory"
			bind:value={d.footRiskCategory}
			options={[
				{ value: 'low', label: 'Low Risk' },
				{ value: 'moderate', label: 'Moderate Risk' },
				{ value: 'high', label: 'High Risk' }
			]}
		/>
	</div>
</SectionCard>
