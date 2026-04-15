<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const pc = assessment.data.practiceConfiguration;
</script>

<SectionCard title="Practice Configuration" description="Enter the practice details that will appear in the privacy notice.">
	<TextInput label="Practice Name" name="practiceName" bind:value={pc.practiceName} placeholder="e.g. Riverside Medical Practice" required />
	<TextArea label="Practice Address" name="practiceAddress" bind:value={pc.practiceAddress} placeholder="e.g. 123 High Street, London, SW1A 1AA" required />
	<TextInput label="Data Protection Officer Name" name="dpoName" bind:value={pc.dpoName} placeholder="e.g. Jane Smith" required />
	<TextArea label="DPO Contact Details" name="dpoContactDetails" bind:value={pc.dpoContactDetails} placeholder="e.g. jane.smith@riverside.nhs.uk, 020 7123 4567" required />
	<TextInput label="Research Organisations" name="researchOrganisations" bind:value={pc.researchOrganisations} placeholder="e.g. Clinical Practice Research Datalink, NHS England" />
	<TextInput label="Data Sharing Partners" name="dataSharingPartners" bind:value={pc.dataSharingPartners} placeholder="e.g. NHS England, local hospitals" />
</SectionCard>
