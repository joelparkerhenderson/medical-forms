<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const vf = assessment.data.visualFieldPupils;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Visual Field & Pupils" description="Visual field testing and pupil reactions">
	<RadioGroup label="Was a visual field test performed?" name="vfPerformed" options={yesNo} bind:value={vf.visualFieldTestPerformed} />

	{#if vf.visualFieldTestPerformed === 'yes'}
		<SelectInput
			label="Test type"
			name="vfTestType"
			options={[
				{ value: 'confrontation', label: 'Confrontation' },
				{ value: 'humphrey', label: 'Humphrey' },
				{ value: 'goldmann', label: 'Goldmann' },
				{ value: 'octopus', label: 'Octopus' }
			]}
			bind:value={vf.visualFieldTestType}
		/>

		<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
			<SelectInput
				label="Right eye result"
				name="vfResultRight"
				options={[
					{ value: 'normal', label: 'Normal' },
					{ value: 'abnormal', label: 'Abnormal' }
				]}
				bind:value={vf.visualFieldResultRight}
			/>
			<SelectInput
				label="Left eye result"
				name="vfResultLeft"
				options={[
					{ value: 'normal', label: 'Normal' },
					{ value: 'abnormal', label: 'Abnormal' }
				]}
				bind:value={vf.visualFieldResultLeft}
			/>
		</div>

		{#if vf.visualFieldResultRight === 'abnormal' || vf.visualFieldResultLeft === 'abnormal'}
			<TextArea label="Visual field defect details" name="vfDetails" bind:value={vf.visualFieldDetails} />
		{/if}
	{/if}

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Pupil Reactions</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Right pupil reaction"
			name="pupilRight"
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'sluggish', label: 'Sluggish' },
				{ value: 'fixed', label: 'Fixed' }
			]}
			bind:value={vf.pupilReactionRight}
		/>
		<SelectInput
			label="Left pupil reaction"
			name="pupilLeft"
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'sluggish', label: 'Sluggish' },
				{ value: 'fixed', label: 'Fixed' }
			]}
			bind:value={vf.pupilReactionLeft}
		/>
	</div>

	<RadioGroup label="Is a relative afferent pupillary defect (RAPD) present?" name="rapd" options={yesNo} bind:value={vf.rapdPresent} />
	{#if vf.rapdPresent === 'yes'}
		<RadioGroup
			label="Which eye?"
			name="rapdEye"
			options={[
				{ value: 'left', label: 'Left' },
				{ value: 'right', label: 'Right' },
				{ value: 'both', label: 'Both' }
			]}
			bind:value={vf.rapdEye}
		/>
	{/if}

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Colour Vision</h3>
	<RadioGroup label="Is colour vision normal?" name="colourVision" options={yesNo} bind:value={vf.colourVisionNormal} />
	{#if vf.colourVisionNormal === 'no'}
		<TextArea label="Colour vision test details" name="colourDetails" bind:value={vf.colourVisionDetails} />
	{/if}
</SectionCard>
