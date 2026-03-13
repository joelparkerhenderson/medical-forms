<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const w = assessment.data.otherWishes;
</script>

<SectionCard title="Other Wishes" description="Preferences that inform your care (these are NOT legally binding)">
	<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
		<p class="font-semibold">Please note</p>
		<p class="mt-1">This section records your preferences and wishes. Unlike the treatment refusals in the previous sections, these wishes are <strong>not legally binding</strong> but will be taken into account by healthcare professionals when planning your care.</p>
	</div>

	<TextArea
		label="Preferred Care Setting"
		name="preferredCareSetting"
		bind:value={w.preferredCareSetting}
		rows={3}
		placeholder="e.g. 'I wish to remain at home if possible' or 'I would prefer to be in a hospice'"
	/>

	<TextArea
		label="Comfort Measures"
		name="comfortMeasures"
		bind:value={w.comfortMeasures}
		rows={3}
		placeholder="e.g. 'Please ensure adequate pain relief' or 'I would like to listen to music'"
	/>

	<TextArea
		label="Spiritual or Religious Wishes"
		name="spiritualReligiousWishes"
		bind:value={w.spiritualReligiousWishes}
		rows={3}
		placeholder="Any spiritual, religious, or cultural preferences for your care"
	/>

	<TextArea
		label="Other Preferences"
		name="otherPreferences"
		bind:value={w.otherPreferences}
		rows={3}
		placeholder="Any other wishes or preferences about your care"
	/>
</SectionCard>
