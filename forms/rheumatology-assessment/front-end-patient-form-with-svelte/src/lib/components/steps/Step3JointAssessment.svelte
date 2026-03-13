<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const d = assessment.data.jointAssessment;
</script>

<SectionCard title="Joint Assessment" description="28-joint count assessment for DAS28 calculation">
	<p class="mb-4 text-sm text-gray-500">
		The 28-joint count includes bilateral shoulders, elbows, wrists, MCP joints (1-5),
		PIP joints (1-5), and knees. Count each tender or swollen joint.
	</p>

	<NumberInput
		label="Tender Joint Count (TJC28)"
		name="tenderJointCount28"
		bind:value={d.tenderJointCount28}
		min={0}
		max={28}
		required
	/>

	<NumberInput
		label="Swollen Joint Count (SJC28)"
		name="swollenJointCount28"
		bind:value={d.swollenJointCount28}
		min={0}
		max={28}
		required
	/>

	<div class="mb-4">
		<label for="painVAS" class="mb-1 block text-sm font-medium text-gray-700">
			Pain VAS (0-100mm) <span class="text-red-500">*</span>
		</label>
		<input
			id="painVAS"
			type="range"
			min={0}
			max={100}
			bind:value={d.painVAS}
			class="w-full accent-primary"
		/>
		<div class="mt-1 flex justify-between text-xs text-gray-500">
			<span>0 - No pain</span>
			<span class="font-medium text-gray-900">{d.painVAS ?? 0}mm</span>
			<span>100 - Worst pain</span>
		</div>
	</div>

	<div class="mb-4">
		<label for="patientGlobalVAS" class="mb-1 block text-sm font-medium text-gray-700">
			Patient Global Assessment VAS (0-100mm) <span class="text-red-500">*</span>
		</label>
		<input
			id="patientGlobalVAS"
			type="range"
			min={0}
			max={100}
			bind:value={d.patientGlobalVAS}
			class="w-full accent-primary"
		/>
		<div class="mt-1 flex justify-between text-xs text-gray-500">
			<span>0 - Very well</span>
			<span class="font-medium text-gray-900">{d.patientGlobalVAS ?? 0}mm</span>
			<span>100 - Very poor</span>
		</div>
	</div>
</SectionCard>
