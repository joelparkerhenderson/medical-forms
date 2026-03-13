<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import type { MedicationAdministered, FluidTherapy, Procedure } from '$lib/engine/types';

	const tx = casualtyCard.data.treatment;

	function addMedAdmin() {
		tx.medicationsAdministered = [...tx.medicationsAdministered, { drug: '', dose: '', route: '', time: '', givenBy: '' }];
	}
	function removeMedAdmin(index: number) {
		tx.medicationsAdministered = tx.medicationsAdministered.filter((_: MedicationAdministered, i: number) => i !== index);
	}

	function addFluid() {
		tx.fluidTherapy = [...tx.fluidTherapy, { type: '', volume: '', rate: '', timeStarted: '' }];
	}
	function removeFluid(index: number) {
		tx.fluidTherapy = tx.fluidTherapy.filter((_: FluidTherapy, i: number) => i !== index);
	}

	function addProcedure() {
		tx.procedures = [...tx.procedures, { description: '', time: '' }];
	}
	function removeProcedure(index: number) {
		tx.procedures = tx.procedures.filter((_: Procedure, i: number) => i !== index);
	}
</script>

<SectionCard title="Treatment & Interventions" description="Medications administered, fluids, procedures, and other treatments">
	<h3 class="mb-3 text-lg font-semibold text-gray-800">Medications Administered</h3>
	<div class="space-y-3">
		{#each tx.medicationsAdministered as med, i (i)}
			<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-5">
					<input type="text" placeholder="Drug" bind:value={med.drug} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Dose" bind:value={med.dose} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Route" bind:value={med.route} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="time" placeholder="Time" bind:value={med.time} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Given by" bind:value={med.givenBy} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
				</div>
				<button type="button" onclick={() => removeMedAdmin(i)} class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove medication">&times;</button>
			</div>
		{/each}
		<button type="button" onclick={addMedAdmin} class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">
			+ Add Medication
		</button>
	</div>

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Fluid Therapy</h3>
	<div class="space-y-3">
		{#each tx.fluidTherapy as fluid, i (i)}
			<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4">
					<input type="text" placeholder="Type (e.g. NaCl 0.9%)" bind:value={fluid.type} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Volume" bind:value={fluid.volume} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="text" placeholder="Rate" bind:value={fluid.rate} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="time" placeholder="Time Started" bind:value={fluid.timeStarted} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
				</div>
				<button type="button" onclick={() => removeFluid(i)} class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove fluid">&times;</button>
			</div>
		{/each}
		<button type="button" onclick={addFluid} class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">
			+ Add Fluid
		</button>
	</div>

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Procedures</h3>
	<div class="space-y-3">
		{#each tx.procedures as proc, i (i)}
			<div class="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
				<div class="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
					<input type="text" placeholder="Description" bind:value={proc.description} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
					<input type="time" placeholder="Time" bind:value={proc.time} class="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none" />
				</div>
				<button type="button" onclick={() => removeProcedure(i)} class="mt-1 text-red-500 hover:text-red-700" aria-label="Remove procedure">&times;</button>
			</div>
		{/each}
		<button type="button" onclick={addProcedure} class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary">
			+ Add Procedure
		</button>
	</div>

	<hr class="my-6 border-gray-200" />

	<h3 class="mb-3 text-lg font-semibold text-gray-800">Oxygen Therapy</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Device" name="oxygenTherapyDevice" bind:value={tx.oxygenTherapyDevice} placeholder="e.g. nasal cannula, face mask" />
		<TextInput label="Flow Rate" name="oxygenTherapyFlowRate" bind:value={tx.oxygenTherapyFlowRate} placeholder="e.g. 2 L/min" />
	</div>

	<RadioGroup
		label="Tetanus Prophylaxis"
		name="tetanusProphylaxis"
		bind:value={tx.tetanusProphylaxis}
		options={[
			{ value: 'given', label: 'Given' },
			{ value: 'not-indicated', label: 'Not Indicated' },
			{ value: 'status-checked', label: 'Status Checked' }
		]}
	/>
</SectionCard>
