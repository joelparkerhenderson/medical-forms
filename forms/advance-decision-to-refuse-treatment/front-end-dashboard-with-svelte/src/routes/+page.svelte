<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let validityFilter = $state('');
	let lifeSustainingFilter = $state('');
	let witnessedFilter = $state('');
	let lpaFilter = $state('');
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

	const validityOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'Draft', label: 'Draft' },
		{ value: 'Complete', label: 'Complete' },
		{ value: 'Valid', label: 'Valid' },
		{ value: 'Invalid', label: 'Invalid' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	const lpaOptions = [
		{ value: '', label: 'All LPA statuses' },
		{ value: 'None', label: 'None' },
		{ value: 'Health & Welfare', label: 'Health & Welfare' },
		{ value: 'Property & Financial', label: 'Property & Financial' },
	];

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
			id: 'validityStatus',
			header: 'Validity Status',
			width: 130,
			sort: true,
		},
		{
			id: 'lifeSustainingRefusal',
			header: 'Life-Sustaining',
			width: 130,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
		{
			id: 'witnessed',
			header: 'Witnessed',
			width: 110,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
		{
			id: 'reviewDate',
			header: 'Review Date',
			width: 130,
			sort: true,
			template: (value: string) => (value ? value : '—'),
		},
		{
			id: 'lpaStatus',
			header: 'LPA Status',
			width: 160,
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
					row.patientName.toLowerCase().includes(term) ||
					row.validityStatus.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Validity status filter
			if (validityFilter && row.validityStatus !== validityFilter) {
				return false;
			}

			// Life-sustaining refusal filter
			if (lifeSustainingFilter === 'yes' && !row.lifeSustainingRefusal) return false;
			if (lifeSustainingFilter === 'no' && row.lifeSustainingRefusal) return false;

			// Witnessed filter
			if (witnessedFilter === 'yes' && !row.witnessed) return false;
			if (witnessedFilter === 'no' && row.witnessed) return false;

			// LPA status filter
			if (lpaFilter && row.lpaStatus !== lpaFilter) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		validityFilter = '';
		lifeSustainingFilter = '';
		witnessedFilter = '';
		lpaFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' ||
			validityFilter !== '' ||
			lifeSustainingFilter !== '' ||
			witnessedFilter !== '' ||
			lpaFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">
				Advance Decision to Refuse Treatment — Clinician Dashboard
			</h1>
			<p class="mt-1 text-sm text-blue-100">
				Patient ADRTs with validity status and legal compliance
			</p>
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
						placeholder="NHS number, name, or status..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Validity Status -->
				<div>
					<label for="validity-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Validity Status
					</label>
					<select
						id="validity-filter"
						bind:value={validityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each validityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Life-Sustaining Refusal -->
				<div>
					<label
						for="life-sustaining-filter"
						class="mb-1 block text-sm font-medium text-gray-700"
					>
						Life-Sustaining
					</label>
					<select
						id="life-sustaining-filter"
						bind:value={lifeSustainingFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each yesNoOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Witnessed -->
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

				<!-- LPA Status -->
				<div>
					<label for="lpa-filter" class="mb-1 block text-sm font-medium text-gray-700">
						LPA Status
					</label>
					<select
						id="lpa-filter"
						bind:value={lpaFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each lpaOptions as opt (opt.value)}
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
