<script lang="ts">
  import { goto } from '$app/navigation';
  import { assessment } from '$lib/stores/assessment.svelte';
  import { calculatePriorityLevel } from '$lib/engine/prescription-grader';
  import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
  import SectionCard from '$lib/components/ui/SectionCard.svelte';
  import TextInput from '$lib/components/ui/TextInput.svelte';
  import TextArea from '$lib/components/ui/TextArea.svelte';
  import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
  import SelectInput from '$lib/components/ui/SelectInput.svelte';

  const p = assessment.data.patientInformation;
  const c = assessment.data.clinicianInformation;
  const d = assessment.data.prescriptionDetails;
  const s = assessment.data.substitutionOptions;
  const r = assessment.data.requestType;

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const newRefillOptions = [
    { value: 'yes', label: 'New Prescription' },
    { value: 'no', label: 'Refill / Repeat' }
  ];

  const emergencyOptions = [
    { value: 'yes', label: 'Emergency' },
    { value: 'no', label: 'Normal' }
  ];

  const routeOptions = [
    { value: 'oral', label: 'Oral' },
    { value: 'topical', label: 'Topical' },
    { value: 'intravenous', label: 'Intravenous' },
    { value: 'intramuscular', label: 'Intramuscular' },
    { value: 'subcutaneous', label: 'Subcutaneous' },
    { value: 'inhaled', label: 'Inhaled' },
    { value: 'rectal', label: 'Rectal' },
    { value: 'sublingual', label: 'Sublingual' },
    { value: 'transdermal', label: 'Transdermal' },
    { value: 'other', label: 'Other' }
  ];

  function submitForm() {
    const { priorityLevel, firedRules } = calculatePriorityLevel(assessment.data);
    const additionalFlags = detectAdditionalFlags(assessment.data);
    assessment.result = {
      priorityLevel,
      firedRules,
      additionalFlags,
      timestamp: new Date().toISOString()
    };
    goto('/report');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <header class="border-b border-gray-200 bg-white shadow-sm no-print">
    <div class="mx-auto max-w-3xl px-4 py-4">
      <h1 class="text-2xl font-bold text-gray-900">Prescription Request Form</h1>
      <p class="mt-1 text-sm text-gray-500">Complete all sections below to submit a prescription request</p>
    </div>
  </header>

  <main class="mx-auto max-w-3xl px-4 py-6">
    <!-- Section 1: Patient Information -->
    <SectionCard title="Patient Information" description="Details of the patient requesting the prescription">
      <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <TextInput label="First Name" name="firstName" bind:value={p.firstName} required />
        <TextInput label="Last Name" name="lastName" bind:value={p.lastName} required />
      </div>
      <TextInput label="NHS Patient Number" name="nhsNumber" bind:value={p.nhsNumber} placeholder="e.g. 943 476 5919" />
      <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <TextInput label="Phone" name="phone" bind:value={p.phone} required />
        <TextInput label="Email" name="email" type="email" bind:value={p.email} />
      </div>
    </SectionCard>

    <!-- Section 2: Clinician Information -->
    <SectionCard title="Clinician Information" description="Details of the prescribing clinician">
      <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <TextInput label="First Name" name="clinFirstName" bind:value={c.firstName} required />
        <TextInput label="Last Name" name="clinLastName" bind:value={c.lastName} required />
      </div>
      <TextInput label="NHS Employee Number" name="nhsEmployeeNumber" bind:value={c.nhsEmployeeNumber} placeholder="e.g. C1234567" />
      <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <TextInput label="Phone" name="clinPhone" bind:value={c.phone} required />
        <TextInput label="Email" name="clinEmail" type="email" bind:value={c.email} />
      </div>
    </SectionCard>

    <!-- Section 3: Prescription Details -->
    <SectionCard title="Prescription Details" description="Medication and dosage information">
      <TextInput label="Request Date" name="requestDate" type="date" bind:value={d.requestDate} required />
      <TextInput label="Medication Name" name="medicationName" bind:value={d.medicationName} required placeholder="e.g. Amoxicillin" />
      <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <TextInput label="Dosage" name="dosage" bind:value={d.dosage} required placeholder="e.g. 500mg" />
        <TextInput label="Frequency" name="frequency" bind:value={d.frequency} placeholder="e.g. TDS, BD, OD" />
      </div>
      <SelectInput label="Route of Administration" name="route" options={routeOptions} bind:value={d.routeOfAdministration} />
      <TextArea label="Treatment Instructions" name="treatmentInstructions" bind:value={d.treatmentInstructions} placeholder="Instructions for the patient..." />
    </SectionCard>

    <!-- Section 4: Substitution Options -->
    <SectionCard title="Substitution Options" description="Indicate whether alternatives are acceptable">
      <RadioGroup label="Allow brand name substitution?" name="allowBrand" options={yesNoOptions} bind:value={s.allowBrandSubstitution} />
      <RadioGroup label="Allow generic substitution?" name="allowGeneric" options={yesNoOptions} bind:value={s.allowGenericSubstitution} />
      <RadioGroup label="Allow dosage adjustment?" name="allowDosage" options={yesNoOptions} bind:value={s.allowDosageAdjustment} />
      <TextArea label="Substitution Notes" name="substitutionNotes" bind:value={s.substitutionNotes} placeholder="Any additional notes about substitution preferences..." />
    </SectionCard>

    <!-- Section 5: Request Type -->
    <SectionCard title="Request Type" description="Classify this prescription request">
      <RadioGroup label="Is this a new prescription or a refill?" name="isNew" options={newRefillOptions} bind:value={r.isNewPrescription} required />
      <RadioGroup label="Is this an emergency request?" name="isEmergency" options={emergencyOptions} bind:value={r.isEmergency} required />
      <TextArea label="Additional Notes" name="additionalNotes" bind:value={r.additionalNotes} placeholder="Any other information relevant to this request..." />
    </SectionCard>

    <!-- Submit -->
    <div class="mt-4 mb-12 flex justify-end">
      <button
        type="button"
        onclick={submitForm}
        class="rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Submit Prescription Request
      </button>
    </div>
  </main>
</div>
