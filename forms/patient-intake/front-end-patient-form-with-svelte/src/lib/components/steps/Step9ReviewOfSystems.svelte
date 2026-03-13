<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ros = assessment.data.reviewOfSystems;
</script>

<SectionCard title="Review of Systems" description="Please note any current symptoms in each area. Leave blank if none.">
	<TextArea label="Constitutional (fever, weight changes, fatigue)" name="constitutional" bind:value={ros.constitutional} placeholder="e.g. unexplained weight loss, persistent fatigue" />

	<TextArea label="HEENT (Head, Eyes, Ears, Nose, Throat)" name="heent" bind:value={ros.heent} placeholder="e.g. headaches, vision changes, hearing loss" />

	<TextArea label="Cardiovascular" name="cardiovascular" bind:value={ros.cardiovascular} placeholder="e.g. chest pain, palpitations, shortness of breath on exertion" />

	<TextArea label="Respiratory" name="respiratory" bind:value={ros.respiratory} placeholder="e.g. cough, wheezing, shortness of breath" />

	<TextArea label="Gastrointestinal" name="gastrointestinal" bind:value={ros.gastrointestinal} placeholder="e.g. nausea, abdominal pain, changes in bowel habits" />

	<TextArea label="Genitourinary" name="genitourinary" bind:value={ros.genitourinary} placeholder="e.g. urinary frequency, pain, blood in urine" />

	<TextArea label="Musculoskeletal" name="musculoskeletal" bind:value={ros.musculoskeletal} placeholder="e.g. joint pain, stiffness, swelling" />

	<TextArea label="Neurological" name="neurological" bind:value={ros.neurological} placeholder="e.g. numbness, tingling, weakness, seizures" />

	<TextArea label="Psychiatric" name="psychiatric" bind:value={ros.psychiatric} placeholder="e.g. anxiety, depression, sleep disturbance" />

	<TextArea label="Skin" name="skin" bind:value={ros.skin} placeholder="e.g. rashes, lesions, changes in moles" />
</SectionCard>
