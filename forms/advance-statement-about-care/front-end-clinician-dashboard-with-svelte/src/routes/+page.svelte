<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let completenessFilter = $state('');
	let witnessedFilter = $state('');
	let gridApi = $state<any>(null);

	// Load patients from backend API, fall back to sample data
	$effect(() => {
		fetchPatients()
			.then((items) => {
				if (items.length > 0) {
					patients = items;
				}
				loading = false;
			})
			.catch(() => {
				// Backend unavailable — use sample data
				loading = false;
			});
	});

	const completenessOptions = [
		{ value: '', label: 'All levels' },
		{ value: 'incomplete', label: 'Incomplete' },
		{ value: 'partial', label: 'Partial' },
		{ value: 'complete', label: 'Complete' },
		{ value: 'verified', label: 'Verified' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	function completenessLabel(level: string): string {
		switch (level) {
			case 'incomplete': return 'Incomplete';
			case 'partial': return 'Partial';
			case 'complete': return 'Complete';
			case 'verified': return 'Verified';
			default: return level;
		}
	}

	const columns = [
		{
			id: 'nhsNumber',
			header: 'NHS Number',
			width: 140,
			sort: true,
		},
		{
			id: 'patientName',
			header: 'Patient Name',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'completenessLevel',
			header: 'Completeness',
			width: 130,
			sort: true,
			template: (value: string) => completenessLabel(value),
		},
		{
			id: 'reviewDate',
			header: 'Review Date',
			width: 130,
			sort: true,
			template: (value: string) => value || 'Not set',
		},
		{
			id: 'witnessed',
			header: 'Witnessed',
			width: 100,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
		{
			id: 'lastUpdated',
			header: 'Last Updated',
			width: 130,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function applyFilters() {
		if (!gridApi) return;

		const term = searchTerm.toLowerCase();

		const filter = (row: PatientRow) => {
			// Text search across key fields
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Completeness level filter
			if (completenessFilter && row.completenessLevel !== completenessFilter) {
				return false;
			}

			// Witnessed filter
			if (witnessedFilter === 'yes' && !row.witnessed) return false;
			if (witnessedFilter === 'no' && row.witnessed) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		completenessFilter = '';
		witnessedFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || completenessFilter !== '' || witnessedFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Advance Statement About Care — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient advance statement status and review dates</p>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<!-- Filters bar -->
		<div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
			<div class="flex flex-wrap items-end gap-4">
				<!-- Search -->
				<div class="min-w-[240px] flex-1">
					<label for="search" class="mb-1 block text-sm font-medium text-gray-700">
						Search
					</label>
					<input
						id="search"
						type="text"
						placeholder="NHS number or patient name..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Completeness Level -->
				<div>
					<label for="completeness-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Completeness
					</label>
					<select
						id="completeness-filter"
						bind:value={completenessFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each completenessOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Witnessed flag -->
				<div>
					<label for="witnessed-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Witnessed
					</label>
					<select
						id="witnessed-filter"
						bind:value={witnessedFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each yesNoOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Clear filters -->
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
					Loading patients...
				</div>
			{:else}
				<Willow>
					<Grid data={patients} {columns} {init} />
				</Willow>
			{/if}
		</div>

		<!-- Summary -->
		<div class="mt-4 flex items-center gap-4 text-sm text-muted">
			<span>{patients.length} patients total</span>
			{#if error}
				<span class="text-warning">{error}</span>
			{/if}
		</div>
	</main>
</div>
