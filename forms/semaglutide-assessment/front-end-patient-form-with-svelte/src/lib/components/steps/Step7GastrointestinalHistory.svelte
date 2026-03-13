<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const gi = assessment.data.gastrointestinalHistory;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Gastrointestinal History" description="GI conditions relevant to semaglutide tolerability and safety">
	<RadioGroup label="History of nausea" name="nauseaHistory" options={yesNoOptions} bind:value={gi.nauseaHistory} />
	<RadioGroup label="History of vomiting" name="vomitingHistory" options={yesNoOptions} bind:value={gi.vomitingHistory} />
	<RadioGroup label="Gastroparesis (delayed gastric emptying)" name="gastroparesis" options={yesNoOptions} bind:value={gi.gastroparesis} />
	<RadioGroup label="History of gallstones (cholelithiasis)" name="gallstoneHistory" options={yesNoOptions} bind:value={gi.gallstoneHistory} />
	<RadioGroup label="Inflammatory bowel disease (IBD)" name="ibd" options={yesNoOptions} bind:value={gi.ibd} />
	<RadioGroup label="Gastro-oesophageal reflux disease (GERD)" name="gerdHistory" options={yesNoOptions} bind:value={gi.gerdHistory} />
	<RadioGroup label="Previous bariatric surgery" name="previousBariatricSurgery" options={yesNoOptions} bind:value={gi.previousBariatricSurgery} />

	<TextArea
		label="Current GI Symptoms"
		name="currentGISymptoms"
		bind:value={gi.currentGISymptoms}
		placeholder="Describe any current gastrointestinal symptoms..."
	/>
</SectionCard>
