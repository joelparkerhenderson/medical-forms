<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const ap = casualtyCard.data.assessmentPlan;
</script>

<SectionCard title="Assessment & Plan" description="Working diagnosis and clinical plan">
	<TextInput label="Working Diagnosis" name="workingDiagnosis" bind:value={ap.workingDiagnosis} required />
	<TextArea label="Differential Diagnoses" name="differentialDiagnoses" bind:value={ap.differentialDiagnoses} rows={3} />
	<TextArea label="Clinical Impression" name="clinicalImpression" bind:value={ap.clinicalImpression} rows={3} />
	<TextArea label="Risk Stratification" name="riskStratification" bind:value={ap.riskStratification} rows={2} placeholder="e.g. HEART score, Wells score, CURB-65" />
</SectionCard>
