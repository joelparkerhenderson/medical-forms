<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const d = assessment.data.reviewCalculate;
</script>

<SectionCard title="Review & Calculate" description="Clinician details and final review before risk calculation">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Clinician Name" name="clinicianName" bind:value={d.clinicianName} />
		<TextInput label="Review Date" name="reviewDate" bind:value={d.reviewDate} type="date" />
	</div>
	<TextArea label="Clinical Notes" name="clinicalNotes" bind:value={d.clinicalNotes} rows={4} placeholder="Any additional clinical observations..." />
	<NumberInput label="AUDIT Score" name="auditScore" bind:value={d.auditScore} min={0} max={40} />
	<div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<p class="font-medium">Ready to calculate?</p>
		<p class="mt-1">Click "Submit Assessment" below to calculate the 10-year CVD risk, heart age, and review any flagged issues.</p>
	</div>
</SectionCard>
