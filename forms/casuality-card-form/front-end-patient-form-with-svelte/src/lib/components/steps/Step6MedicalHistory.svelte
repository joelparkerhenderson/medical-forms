<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import type { Medication, Allergy, AllergySeverity } from '$lib/engine/types';

	const mh = casualtyCard.data.medicalHistory;

	const severityOptions: { value: AllergySeverity; label: string }[] = [
		{ value: 'mild', label: 'Mild' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'anaphylaxis', label: 'Anaphylaxis' }
	];

	function addMedication() {
		mh.medications = [...mh.medications, { name: '', dose: '', frequency: '' }];
	}

	function removeMedication(index: number) {
		mh.medications = mh.medications.filter((_: Medication, i: number) => i !== index);
	}

	function addAllergy() {
		mh.allergies = [...mh.allergies, { allergen: '', reaction: '', severity: '' }];
	}

	function removeAllergy(index: number) {
		mh.allergies = mh.allergies.filter((_: Allergy, i: number) => i !== index);
	}
</script>

<SectionCard title="Medical History" description="Past medical history, medications, allergies, and social history">
	<TextArea label="Past Medical History" name="pastMedicalHistory" bind:value={mh.pastMedicalHistory} rows={3} />
	<TextArea label="Past Surgical History" name="pastSurgicalHistory" bind:value={mh.pastSurgicalHistory} rows={2} />

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Medications</h3>
	<div class="space-y-3">
		{#each mh.medications as med, i (i)}
			<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
					<input type="text" placeholder="Medication name" bind:value={med.name} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Dose" bind:value={med.dose} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Frequency" bind:value={med.frequency} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
				</div>
				<button type="button" onclick={() => removeMedication(i)} class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove medication">&times;</button>
			</div>
		{/each}
		<button type="button" onclick={addMedication} class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">
			+ Add Medication
		</button>
	</div>

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Allergies</h3>
	<div class="space-y-3">
		{#each mh.allergies as allergy, i (i)}
			<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
					<input type="text" placeholder="Allergen" bind:value={allergy.allergen} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Reaction" bind:value={allergy.reaction} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<select bind:value={allergy.severity} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none">
						<option value="">Severity</option>
						{#each severityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<button type="button" onclick={() => removeAllergy(i)} class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove allergy">&times;</button>
			</div>
		{/each}
		<button type="button" onclick={addAllergy} class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">
			+ Add Allergy
		</button>
	</div>

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Other History</h3>
	<RadioGroup
		label="Tetanus Status"
		name="tetanusStatus"
		bind:value={mh.tetanusStatus}
		options={[
			{ value: 'up-to-date', label: 'Up to date' },
			{ value: 'not-up-to-date', label: 'Not up to date' },
			{ value: 'unknown', label: 'Unknown' }
		]}
	/>
	<RadioGroup
		label="Smoking Status"
		name="smokingStatus"
		bind:value={mh.smokingStatus}
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
	/>
	<TextInput label="Alcohol Consumption" name="alcoholConsumption" bind:value={mh.alcoholConsumption} placeholder="e.g. 10 units/week" />
	<TextInput label="Recreational Drug Use" name="recreationalDrugUse" bind:value={mh.recreationalDrugUse} />
	<TextInput label="Last Oral Intake" name="lastOralIntake" bind:value={mh.lastOralIntake} placeholder="Time and type of last food/drink" />
</SectionCard>
