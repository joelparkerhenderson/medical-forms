<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const s = assessment.data.currentSymptoms;

	const bodyLocations = [
		{ value: 'neck', label: 'Neck' },
		{ value: 'upper-back', label: 'Upper Back' },
		{ value: 'lower-back', label: 'Lower Back' },
		{ value: 'left-shoulder', label: 'Left Shoulder' },
		{ value: 'right-shoulder', label: 'Right Shoulder' },
		{ value: 'left-elbow', label: 'Left Elbow' },
		{ value: 'right-elbow', label: 'Right Elbow' },
		{ value: 'left-wrist-hand', label: 'Left Wrist/Hand' },
		{ value: 'right-wrist-hand', label: 'Right Wrist/Hand' },
		{ value: 'left-hip', label: 'Left Hip' },
		{ value: 'right-hip', label: 'Right Hip' },
		{ value: 'left-knee', label: 'Left Knee' },
		{ value: 'right-knee', label: 'Right Knee' },
		{ value: 'left-ankle-foot', label: 'Left Ankle/Foot' },
		{ value: 'right-ankle-foot', label: 'Right Ankle/Foot' }
	];

	function handlePainInput(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.value === '') {
			s.painSeverity = null;
		} else {
			const num = Number(target.value);
			if (!isNaN(num) && num >= 0 && num <= 10) {
				assessment.data.currentSymptoms.painSeverity = num as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
			}
		}
	}
</script>

<SectionCard title="Current Symptoms" description="Pain and discomfort you are currently experiencing">
	<CheckboxGroup label="Where do you experience pain or discomfort? (select all that apply)" options={bodyLocations} bind:values={s.painLocations} />

	<div class="mb-4">
		<label for="painSeverity" class="mb-1 block text-sm font-medium text-gray-700">
			Pain Severity (0 = no pain, 10 = worst possible)
		</label>
		<input
			id="painSeverity"
			name="painSeverity"
			type="range"
			min="0"
			max="10"
			step="1"
			value={s.painSeverity ?? 0}
			oninput={handlePainInput}
			class="w-full accent-primary"
		/>
		<div class="mt-1 flex justify-between text-xs text-gray-500">
			<span>0 - None</span>
			<span class="font-medium text-gray-900">{s.painSeverity ?? 'N/A'}</span>
			<span>10 - Worst</span>
		</div>
	</div>

	<TextInput label="When did symptoms start?" name="onsetDate" type="date" bind:value={s.onsetDate} />

	<SelectInput
		label="How long have you had these symptoms?"
		name="duration"
		options={[
			{ value: 'less-than-1-week', label: 'Less than 1 week' },
			{ value: '1-4-weeks', label: '1-4 weeks' },
			{ value: '1-3-months', label: '1-3 months' },
			{ value: '3-6-months', label: '3-6 months' },
			{ value: 'more-than-6-months', label: 'More than 6 months' }
		]}
		bind:value={s.duration}
	/>

	<TextArea label="What makes the symptoms worse?" name="aggravating" bind:value={s.aggravatingFactors} placeholder="e.g., prolonged sitting, typing, lifting..." />

	<TextArea label="What helps relieve the symptoms?" name="relieving" bind:value={s.relievingFactors} placeholder="e.g., stretching, breaks, heat packs..." />

	<SelectInput
		label="Impact on your ability to work"
		name="impactOnWork"
		options={[
			{ value: 'none', label: 'No impact' },
			{ value: 'mild', label: 'Mild - can work with minor discomfort' },
			{ value: 'moderate', label: 'Moderate - work is affected' },
			{ value: 'severe', label: 'Severe - significantly limited' },
			{ value: 'unable-to-work', label: 'Unable to work' }
		]}
		bind:value={s.impactOnWork}
	/>
</SectionCard>
