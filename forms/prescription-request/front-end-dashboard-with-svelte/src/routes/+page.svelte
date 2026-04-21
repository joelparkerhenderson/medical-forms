<script lang="ts">
  import { Grid, Willow } from '@svar-ui/svelte-grid';
  import { fetchPrescriptions } from '$lib/api.ts';
  import { prescriptions as samplePrescriptions } from '$lib/data.ts';
  import type { PrescriptionRow } from '$lib/types.ts';

  let prescriptions = $state<PrescriptionRow[]>(samplePrescriptions);
  let loading = $state(true);
  let error = $state('');
  let searchTerm = $state('');
  let priorityFilter = $state('');
  let typeFilter = $state('');
  let gridApi = $state<any>(null);

  $effect(() => {
    fetchPrescriptions()
      .then((items) => {
        if (items.length > 0) {
          prescriptions = items;
        }
        loading = false;
      })
      .catch(() => {
        loading = false;
      });
  });

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'routine', label: 'Routine' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'emergency', label: 'Emergency' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'New', label: 'New' },
    { value: 'Refill', label: 'Refill' },
  ];

  const columns = [
    { id: 'patientName', header: 'Patient', flexgrow: 1, sort: true },
    { id: 'medicationName', header: 'Medication', flexgrow: 1, sort: true },
    { id: 'dosage', header: 'Dosage', width: 120, sort: true },
    { id: 'requestType', header: 'Type', width: 80, sort: true },
    {
      id: 'priorityLevel',
      header: 'Priority',
      width: 110,
      sort: true,
      template: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
    },
    { id: 'requestDate', header: 'Date', width: 110, sort: true },
    {
      id: 'status',
      header: 'Status',
      width: 100,
      sort: true,
      template: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
    },
  ];

  function init(api: any) {
    gridApi = api;
    api.exec('sort-rows', { key: 'requestDate', order: 'desc' });
  }

  function applyFilters() {
    if (!gridApi) return;

    const term = searchTerm.toLowerCase();

    const filter = (row: PrescriptionRow) => {
      if (term) {
        const matches =
          row.patientName.toLowerCase().includes(term) ||
          row.medicationName.toLowerCase().includes(term) ||
          row.nhsNumber.toLowerCase().includes(term) ||
          row.clinicianName.toLowerCase().includes(term);
        if (!matches) return false;
      }

      if (priorityFilter && row.priorityLevel !== priorityFilter) return false;
      if (typeFilter && row.requestType !== typeFilter) return false;

      return true;
    };

    gridApi.exec('filter-rows', { filter });
  }

  function clearFilters() {
    searchTerm = '';
    priorityFilter = '';
    typeFilter = '';
    if (gridApi) {
      gridApi.exec('filter-rows', { filter: () => true });
    }
  }

  let hasActiveFilters = $derived(
    searchTerm !== '' || priorityFilter !== '' || typeFilter !== ''
  );
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-nhs-blue text-white shadow">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <h1 class="text-2xl font-bold">Prescription Request -- Clinician Dashboard</h1>
      <p class="mt-1 text-sm text-blue-100">Prescription requests with priority classification</p>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
    <!-- Filters bar -->
    <div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-end gap-4">
        <div class="min-w-[240px] flex-1">
          <label for="search" class="mb-1 block text-sm font-medium text-gray-700">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Patient, medication, NHS number, or clinician..."
            bind:value={searchTerm}
            oninput={applyFilters}
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label for="priority-filter" class="mb-1 block text-sm font-medium text-gray-700">Priority</label>
          <select
            id="priority-filter"
            bind:value={priorityFilter}
            onchange={applyFilters}
            class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {#each priorityOptions as opt (opt.value)}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="type-filter" class="mb-1 block text-sm font-medium text-gray-700">Type</label>
          <select
            id="type-filter"
            bind:value={typeFilter}
            onchange={applyFilters}
            class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          >
            {#each typeOptions as opt (opt.value)}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>

        {#if hasActiveFilters}
          <button
            onclick={clearFilters}
            class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Clear filters
          </button>
        {/if}
      </div>
    </div>

    <!-- Data grid -->
    <div class="rounded-lg bg-white shadow-sm" style="height: 600px;">
      {#if loading}
        <div class="flex h-full items-center justify-center text-muted">
          Loading prescriptions...
        </div>
      {:else}
        <Willow>
          <Grid data={prescriptions} {columns} {init} />
        </Willow>
      {/if}
    </div>

    <!-- Summary -->
    <div class="mt-4 flex items-center gap-4 text-sm text-muted">
      <span>{prescriptions.length} prescription requests total</span>
      {#if error}
        <span class="text-warning">{error}</span>
      {/if}
    </div>
  </main>
</div>
