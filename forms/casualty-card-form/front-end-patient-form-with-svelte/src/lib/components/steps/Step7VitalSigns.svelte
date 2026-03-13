<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import { calculateNEWS2 } from '$lib/engine/news2-calculator';
	import { news2ResponseLabel, news2ResponseColor } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const v = casualtyCard.data.vitalSigns;

	const news2 = $derived(calculateNEWS2(v));
	const hasAnyVitals = $derived(
		v.heartRate !== null ||
		v.systolicBP !== null ||
		v.respiratoryRate !== null ||
		v.oxygenSaturation !== null ||
		v.temperature !== null ||
		v.consciousnessLevel !== ''
	);
</script>

<SectionCard title="Vital Signs" description="Observations and NEWS2 auto-calculation">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Heart Rate" name="heartRate" bind:value={v.heartRate} min={0} max={300} unit="bpm" />
		<NumberInput label="Respiratory Rate" name="respiratoryRate" bind:value={v.respiratoryRate} min={0} max={60} unit="/min" />
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Systolic BP" name="systolicBP" bind:value={v.systolicBP} min={0} max={300} unit="mmHg" />
		<NumberInput label="Diastolic BP" name="diastolicBP" bind:value={v.diastolicBP} min={0} max={200} unit="mmHg" />
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Oxygen Saturation" name="oxygenSaturation" bind:value={v.oxygenSaturation} min={0} max={100} unit="%" />
		<NumberInput label="Temperature" name="temperature" bind:value={v.temperature} min={25} max={45} step={0.1} unit="°C" />
	</div>
	<RadioGroup
		label="Supplemental Oxygen?"
		name="supplementalOxygen"
		bind:value={v.supplementalOxygen}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>
	{#if v.supplementalOxygen === 'yes'}
		<NumberInput label="Oxygen Flow Rate" name="oxygenFlowRate" bind:value={v.oxygenFlowRate} min={0} max={15} unit="L/min" />
	{/if}
	<SelectInput
		label="Consciousness Level (ACVPU)"
		name="consciousnessLevel"
		bind:value={v.consciousnessLevel}
		options={[
			{ value: 'alert', label: 'Alert' },
			{ value: 'verbal', label: 'Responds to Voice' },
			{ value: 'pain', label: 'Responds to Pain' },
			{ value: 'unresponsive', label: 'Unresponsive' }
		]}
	/>
	<NumberInput label="Blood Glucose" name="bloodGlucose" bind:value={v.bloodGlucose} min={0} max={40} step={0.1} unit="mmol/L" />

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Pupils</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Left Pupil Size" name="pupilLeftSize" bind:value={v.pupilLeftSize} min={1} max={9} unit="mm" />
		<RadioGroup
			label="Left Pupil Reactive?"
			name="pupilLeftReactive"
			bind:value={v.pupilLeftReactive}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Right Pupil Size" name="pupilRightSize" bind:value={v.pupilRightSize} min={1} max={9} unit="mm" />
		<RadioGroup
			label="Right Pupil Reactive?"
			name="pupilRightReactive"
			bind:value={v.pupilRightReactive}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Capillary Refill Time" name="capillaryRefillTime" bind:value={v.capillaryRefillTime} min={0} max={10} unit="seconds" />
		<NumberInput label="Weight" name="weight" bind:value={v.weight} min={0} max={300} step={0.1} unit="kg" />
	</div>

	{#if hasAnyVitals}
		<hr class="my-6 border-gray-200" />
		<h3 class="mb-3 text-lg font-semibold text-gray-800">NEWS2 Score (Auto-calculated)</h3>
		<div class="rounded-lg border-2 p-4 {news2ResponseColor(news2.clinicalResponse)}">
			<div class="text-center">
				<div class="text-3xl font-bold">{news2.totalScore}</div>
				<div class="mt-1 text-sm font-medium">{news2ResponseLabel(news2.clinicalResponse)}</div>
			</div>
			<div class="mt-3 space-y-1 text-sm">
				{#each news2.parameterScores as ps (ps.parameter)}
					<div class="flex justify-between">
						<span>{ps.parameter}: {ps.value}</span>
						<span class="font-medium">{ps.score}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</SectionCard>
