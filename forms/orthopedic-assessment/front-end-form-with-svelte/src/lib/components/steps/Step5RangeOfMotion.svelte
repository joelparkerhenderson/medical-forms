<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const rom = assessment.data.rangeOfMotion;
</script>

<SectionCard title="Range of Motion" description="Joint-specific range of motion measurements (in degrees)">
	<TextInput
		label="Joint Assessed"
		name="romJoint"
		bind:value={rom.joint}
		placeholder="e.g., Right shoulder, Left knee"
		required
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Flexion"
			name="flexion"
			bind:value={rom.flexion}
			min={0}
			max={360}
			unit="degrees"
		/>
		<NumberInput
			label="Extension"
			name="extension"
			bind:value={rom.extension}
			min={0}
			max={360}
			unit="degrees"
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Abduction"
			name="abduction"
			bind:value={rom.abduction}
			min={0}
			max={360}
			unit="degrees"
		/>
		<NumberInput
			label="Adduction"
			name="adduction"
			bind:value={rom.adduction}
			min={0}
			max={360}
			unit="degrees"
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Internal Rotation"
			name="internalRotation"
			bind:value={rom.internalRotation}
			min={0}
			max={360}
			unit="degrees"
		/>
		<NumberInput
			label="External Rotation"
			name="externalRotation"
			bind:value={rom.externalRotation}
			min={0}
			max={360}
			unit="degrees"
		/>
	</div>

	<TextArea
		label="Additional Notes"
		name="romNotes"
		bind:value={rom.notes}
		placeholder="Any additional observations about range of motion..."
	/>
</SectionCard>
