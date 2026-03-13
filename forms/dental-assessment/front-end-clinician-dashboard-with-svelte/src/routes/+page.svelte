<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let dmftFilter = $state('');
	let periodontalFilter = $state('');
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

	const dmftOptions = [
		{ value: '', label: 'All DMFT scores' },
		{ value: 'caries-free', label: 'Caries-Free (0)' },
		{ value: 'very-low', label: 'Very Low (1-5)' },
		{ value: 'low', label: 'Low (6-10)' },
		{ value: 'moderate', label: 'Moderate (11-15)' },
		{ value: 'high', label: 'High (16-20)' },
		{ value: 'very-high', label: 'Very High (21+)' },
	];

	const periodontalOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'healthy', label: 'Healthy' },
		{ value: 'gingivitis', label: 'Gingivitis' },
		{ value: 'periodontitis', label: 'Periodontitis' },
	];

	function getDmftCategory(score: number): string {
		if (score === 0) return 'caries-free';
		if (score <= 5) return 'very-low';
		if (score <= 10) return 'low';
		if (score <= 15) return 'moderate';
		if (score <= 20) return 'high';
		return 'very-high';
	}

	function getDmftLabel(score: number): string {
		if (score === 0) return 'Caries-Free';
		if (score <= 5) return 'Very Low';
		if (score <= 10) return 'Low';
		if (score <= 15) return 'Moderate';
		if (score <= 20) return 'High';
		return 'Very High';
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
			id: 'dmftScore',
			header: 'DMFT Score',
			width: 130,
			sort: true,
			template: (value: number) => `${value} (${getDmftLabel(value)})`,
		},
		{
			id: 'chiefComplaint',
			header: 'Chief Complaint',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'periodontalStatus',
			header: 'Periodontal Status',
			width: 180,
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
					row.chiefComplaint.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// DMFT category filter
			if (dmftFilter && getDmftCategory(row.dmftScore) !== dmftFilter) {
				return false;
			}

			// Periodontal status filter
			if (periodontalFilter) {
				const status = row.periodontalStatus.toLowerCase();
				if (periodontalFilter === 'healthy' && !status.includes('healthy')) return false;
				if (periodontalFilter === 'gingivitis' && !status.includes('gingivitis')) return false;
				if (periodontalFilter === 'periodontitis' && !status.includes('periodontitis')) return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		dmftFilter = '';
		periodontalFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || dmftFilter !== '' || periodontalFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Dental Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with dental assessment status</p>
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
						placeholder="NHS number, name, or complaint..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- DMFT Score -->
				<div>
					<label for="dmft-filter" class="mb-1 block text-sm font-medium text-gray-700">
						DMFT Score
					</label>
					<select
						id="dmft-filter"
						bind:value={dmftFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each dmftOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Periodontal Status -->
				<div>
					<label for="periodontal-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Periodontal Status
					</label>
					<select
						id="periodontal-filter"
						bind:value={periodontalFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each periodontalOptions as opt (opt.value)}
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
