<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const r = assessment.data.risksBenefits;
</script>

<SectionCard title="Risks & Benefits" description="Document the risks, benefits, and expected outcomes of the procedure">
	<TextArea
		label="Common Risks"
		name="commonRisks"
		bind:value={r.commonRisks}
		placeholder="List common risks (e.g., pain, bruising, infection)..."
		rows={3}
	/>

	<TextArea
		label="Serious Risks"
		name="seriousRisks"
		bind:value={r.seriousRisks}
		placeholder="List serious or rare risks (e.g., organ injury, significant bleeding)..."
		rows={3}
	/>

	<TextArea
		label="Expected Benefits"
		name="expectedBenefits"
		bind:value={r.expectedBenefits}
		placeholder="Describe the expected benefits of the procedure..."
		rows={3}
	/>

	<TextInput label="Success Rate" name="successRate" bind:value={r.successRate} placeholder="e.g., 95% successful outcome" />

	<TextInput label="Recovery Period" name="recoveryPeriod" bind:value={r.recoveryPeriod} placeholder="e.g., 1-2 weeks" />
</SectionCard>
