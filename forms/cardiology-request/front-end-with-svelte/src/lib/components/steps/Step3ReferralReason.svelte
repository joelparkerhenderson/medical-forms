<script lang="ts">
	import Field from '#lib/components/ui/Field.svelte';
	import Fieldset from '#lib/components/ui/Fieldset.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextAreaInput from '#lib/components/ui/TextAreaInput.svelte';
	import { requestStore } from '#lib/stores/result.svelte.js';

	let d = $derived(requestStore.data);
</script>

<Fieldset legend="3. Referral Reason">
	<p class="hint">The requested service, the primary reason, and the specific clinical question.</p>

	<Field label="Requested service" inputId="requestedService" required>
		<Select id="requestedService" label="Requested service" bind:value={d.requestedService} required>
			<option value="">Select…</option>
			<option value="general-cardiology">General cardiology</option>
			<option value="rapid-access-chest-pain">Rapid-access chest-pain clinic</option>
			<option value="heart-failure">Heart-failure clinic</option>
			<option value="arrhythmia-ep">Arrhythmia / EP clinic</option>
			<option value="valve-clinic">Valve clinic</option>
			<option value="inherited-cardiac-conditions">Inherited cardiac conditions</option>
			<option value="pre-operative-cardiac">Pre-operative cardiac</option>
			<option value="other">Other</option>
		</Select>
	</Field>

	<Field label="Primary reason for referral" inputId="referralReason" required>
		<Select id="referralReason" label="Primary reason for referral" bind:value={d.referralReason} required>
			<option value="">Select…</option>
			<option value="chest-pain">Chest pain</option>
			<option value="breathlessness">Breathlessness</option>
			<option value="palpitations">Palpitations</option>
			<option value="syncope">Syncope</option>
			<option value="heart-failure-symptoms">Heart-failure symptoms</option>
			<option value="murmur-or-valve">Murmur / valve disease</option>
			<option value="abnormal-ecg">Abnormal ECG</option>
			<option value="hypertension">Hypertension</option>
			<option value="arrhythmia">Arrhythmia</option>
			<option value="pre-operative-assessment">Pre-operative assessment</option>
			<option value="other">Other</option>
		</Select>
	</Field>

	<Field label="Specific clinical question" inputId="clinicalQuestion" required>
		<TextAreaInput
			id="clinicalQuestion"
			label="Specific clinical question"
			rows={3}
			placeholder="The specific question the cardiology team is asked to answer…"
			bind:value={d.clinicalQuestion}
		/>
	</Field>

	<Field label="Relevant history" inputId="relevantHistory">
		<TextAreaInput
			id="relevantHistory"
			label="Relevant history"
			rows={3}
			placeholder="Relevant clinical history and context for the referral…"
			bind:value={d.relevantHistory}
		/>
	</Field>
</Fieldset>
