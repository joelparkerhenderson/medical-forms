<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ce = casualtyCard.data.clinicalExamination;
</script>

<SectionCard title="Clinical Examination" description="Systematic clinical examination findings">
	<TextArea label="General Appearance" name="generalAppearance" bind:value={ce.generalAppearance} placeholder="e.g. alert, orientated, comfortable at rest" />
	<TextArea label="Head & Face" name="headAndFace" bind:value={ce.headAndFace} rows={2} />
	<TextArea label="Neck" name="neck" bind:value={ce.neck} rows={2} />
	<TextArea label="Chest — Cardiovascular" name="chestCardiovascular" bind:value={ce.chestCardiovascular} rows={2} />
	<TextArea label="Chest — Respiratory" name="chestRespiratory" bind:value={ce.chestRespiratory} rows={2} />
	<TextArea label="Abdomen" name="abdomen" bind:value={ce.abdomen} rows={2} />
	<TextArea label="Pelvis" name="pelvis" bind:value={ce.pelvis} rows={2} />
	<TextArea label="Musculoskeletal / Limbs" name="musculoskeletalLimbs" bind:value={ce.musculoskeletalLimbs} rows={2} />
	<TextArea label="Neurological" name="neurological" bind:value={ce.neurological} rows={2} />
	<TextArea label="Skin" name="skin" bind:value={ce.skin} rows={2} />
	<TextArea label="Mental State" name="mentalState" bind:value={ce.mentalState} rows={2} />
	<TextArea label="Body Diagram Notes" name="bodyDiagramNotes" bind:value={ce.bodyDiagramNotes} placeholder="Document any injury locations or findings" rows={3} />
</SectionCard>
