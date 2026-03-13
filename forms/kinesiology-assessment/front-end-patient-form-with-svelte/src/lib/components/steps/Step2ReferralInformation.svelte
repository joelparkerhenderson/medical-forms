<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const r = assessment.data.referralInfo;
</script>

<SectionCard title="Referral Information" description="Details about the referral and sport/activity">
	<TextInput
		label="Referring Provider"
		name="referringProvider"
		bind:value={r.referringProvider}
		placeholder="e.g., Dr. Smith, GP"
		required
	/>

	<TextArea
		label="Reason for Referral"
		name="referralReason"
		bind:value={r.referralReason}
		placeholder="e.g., Pre-season screening, injury prevention, return-to-sport clearance"
	/>

	<TextInput
		label="Referral Date"
		name="referralDate"
		type="date"
		bind:value={r.referralDate}
	/>

	<TextInput
		label="Primary Sport or Activity"
		name="sportOrActivity"
		bind:value={r.sportOrActivity}
		placeholder="e.g., Football, Running, Basketball, CrossFit"
		required
	/>
</SectionCard>
