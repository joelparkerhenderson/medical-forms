<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { RenalFunction } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: RenalFunction } = $props();
</script>

<SectionCard title="Renal Function">
	<p class="mb-4 text-sm text-gray-500">Enter the most recent renal function test results.</p>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TextInput label="eGFR (mL/min/1.73m2)" id="egfr" type="number" bind:value={data.egfr} min={0} max={200} step={1} />
		<TextInput label="Creatinine (umol/L)" id="creatinine" type="number" bind:value={data.creatinine} min={0} max={2000} step={1} />
	</div>

	<TextInput label="Urine Albumin-to-Creatinine Ratio (mg/mmol)" id="urineAcr" type="number" bind:value={data.urineAcr} min={0} step={0.1} />

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="mb-4">
			<label for="proteinuria" class="block text-sm font-medium text-gray-700 mb-1">Proteinuria Status</label>
			<select
				id="proteinuria"
				bind:value={data.proteinuria}
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			>
				<option value="">Select...</option>
				<option value="none">None</option>
				<option value="microalbuminuria">Microalbuminuria (ACR 3-30 mg/mmol)</option>
				<option value="macroalbuminuria">Macroalbuminuria (ACR &gt;30 mg/mmol)</option>
			</select>
		</div>
		<div class="mb-4">
			<label for="ckdStage" class="block text-sm font-medium text-gray-700 mb-1">CKD Stage</label>
			<select
				id="ckdStage"
				bind:value={data.ckdStage}
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			>
				<option value="">Select...</option>
				<option value="G1">G1 (eGFR &ge;90)</option>
				<option value="G2">G2 (eGFR 60-89)</option>
				<option value="G3a">G3a (eGFR 45-59)</option>
				<option value="G3b">G3b (eGFR 30-44)</option>
				<option value="G4">G4 (eGFR 15-29)</option>
				<option value="G5">G5 (eGFR &lt;15)</option>
			</select>
		</div>
	</div>
</SectionCard>
