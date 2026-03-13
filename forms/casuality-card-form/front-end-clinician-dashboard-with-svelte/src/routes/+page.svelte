<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let news2Filter = $state('');
	let mtsFilter = $state('');
	let allergyFilter = $state('');
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
				// Backend unavailable -- use sample data
				loading = false;
			});
	});

	const news2Options = [
		{ value: '', label: 'All NEWS2 Levels' },
		{ value: 'low', label: 'Low' },
		{ value: 'low-medium', label: 'Low-Medium' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' },
	];

	const mtsOptions = [
		{ value: '', label: 'All MTS Categories' },
		{ value: '1-immediate', label: '1 - Immediate' },
		{ value: '2-very-urgent', label: '2 - Very Urgent' },
		{ value: '3-urgent', label: '3 - Urgent' },
		{ value: '4-standard', label: '4 - Standard' },
		{ value: '5-non-urgent', label: '5 - Non-Urgent' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
	];

	function capitalize(s: string): string {
		if (!s) return '';
		return s
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join('-');
	}

	function mtsCategoryShort(cat: string): string {
		switch (cat) {
			case '1-immediate':
				return '1 Immediate';
			case '2-very-urgent':
				return '2 Very Urgent';
			case '3-urgent':
				return '3 Urgent';
			case '4-standard':
				return '4 Standard';
			case '5-non-urgent':
				return '5 Non-Urgent';
			default:
				return cat || '';
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
			id: 'news2Score',
			header: 'NEWS2',
			width: 140,
			sort: true,
			template: (value: number, row: PatientRow) =>
				value + ' (' + capitalize(row.news2Response) + ')',
		},
		{
			id: 'mtsCategory',
			header: 'MTS Category',
			width: 140,
			sort: true,
			template: (value: string) => mtsCategoryShort(value),
		},
		{
			id: 'chiefComplaint',
			header: 'Chief Complaint',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'allergyFlag',
			header: 'Allergy',
			width: 100,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
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

			// NEWS2 response filter
			if (news2Filter && row.news2Response !== news2Filter) {
				return false;
			}

			// MTS category filter
			if (mtsFilter && row.mtsCategory !== mtsFilter) {
				return false;
			}

			// Allergy filter
			if (allergyFilter === 'yes' && !row.allergyFlag) return false;
			if (allergyFilter === 'no' && row.allergyFlag) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		news2Filter = '';
		mtsFilter = '';
		allergyFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || news2Filter !== '' || mtsFilter !== '' || allergyFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Casualty Card -- Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">
				Emergency Department patient list with NEWS2 and triage status
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
						placeholder="NHS number, name, or complaint..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- NEWS2 Level -->
				<div>
					<label for="news2-filter" class="mb-1 block text-sm font-medium text-gray-700">
						NEWS2 Level
					</label>
					<select
						id="news2-filter"
						bind:value={news2Filter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each news2Options as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- MTS Category -->
				<div>
					<label for="mts-filter" class="mb-1 block text-sm font-medium text-gray-700">
						MTS Category
					</label>
					<select
						id="mts-filter"
						bind:value={mtsFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each mtsOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Allergy flag -->
				<div>
					<label for="allergy-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Allergy
					</label>
					<select
						id="allergy-filter"
						bind:value={allergyFilter}
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
