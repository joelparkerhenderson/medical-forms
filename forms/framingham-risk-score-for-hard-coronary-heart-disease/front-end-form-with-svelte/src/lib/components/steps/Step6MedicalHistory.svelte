<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const m = assessment.data.medicalHistory;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="The Framingham Risk Score is designed for patients without diabetes or prior CHD. These conditions are flagged if present.">
	<RadioGroup label="Has Diabetes?" name="hasDiabetes" options={yesNoOptions} bind:value={m.hasDiabetes} />
	<RadioGroup label="Has Prior Coronary Heart Disease?" name="hasPriorChd" options={yesNoOptions} bind:value={m.hasPriorChd} />
	<RadioGroup label="Has Peripheral Vascular Disease?" name="hasPeripheralVascularDisease" options={yesNoOptions} bind:value={m.hasPeripheralVascularDisease} />
	<RadioGroup label="Has Cerebrovascular Disease?" name="hasCerebrovascularDisease" options={yesNoOptions} bind:value={m.hasCerebrovascularDisease} />
	<RadioGroup label="Has Heart Failure?" name="hasHeartFailure" options={yesNoOptions} bind:value={m.hasHeartFailure} />
	<RadioGroup label="Has Atrial Fibrillation?" name="hasAtrialFibrillation" options={yesNoOptions} bind:value={m.hasAtrialFibrillation} />

	<div class="mb-4">
		<label for="otherConditions" class="mb-1 block text-sm font-medium text-gray-700">Other Conditions</label>
		<textarea id="otherConditions" name="otherConditions" rows="3" bind:value={m.otherConditions} placeholder="List any other relevant medical conditions" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"></textarea>
	</div>
</SectionCard>
