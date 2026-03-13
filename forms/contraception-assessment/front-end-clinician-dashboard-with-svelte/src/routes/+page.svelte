<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let ukmecFilter = $state('');
	let reviewFilter = $state('');
	let methodFilter = $state('');
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

	const ukmecOptions = [
		{ value: '', label: 'All UKMEC categories' },
		{ value: '1', label: 'UKMEC 1 - No restriction' },
		{ value: '2', label: 'UKMEC 2 - Advantages outweigh risks' },
		{ value: '3', label: 'UKMEC 3 - Risks outweigh advantages' },
		{ value: '4', label: 'UKMEC 4 - Unacceptable risk' },
	];

	const reviewOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'Pending', label: 'Pending' },
		{ value: 'Requires review', label: 'Requires review' },
		{ value: 'Urgent', label: 'Urgent' },
		{ value: 'Completed', label: 'Completed' },
	];

	const methodOptions = [
		{ value: '', label: 'All methods' },
		{ value: 'Combined oral contraceptive', label: 'Combined oral contraceptive' },
		{ value: 'Progestogen-only pill', label: 'Progestogen-only pill' },
		{ value: 'Injectable', label: 'Injectable' },
		{ value: 'Implant', label: 'Implant' },
		{ value: 'Copper IUD', label: 'Copper IUD' },
		{ value: 'LNG-IUS', label: 'LNG-IUS' },
		{ value: 'Contraceptive patch', label: 'Contraceptive patch' },
		{ value: 'Vaginal ring', label: 'Vaginal ring' },
		{ value: 'Barrier methods', label: 'Barrier methods' },
		{ value: 'Natural family planning', label: 'Natural family planning' },
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
			id: 'ukmecCategory',
			header: 'UKMEC',
			width: 90,
			sort: true,
			template: (value: number) => `Cat. ${value}`,
		},
		{
			id: 'preferredMethod',
			header: 'Preferred Method',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'currentMethod',
			header: 'Current Method',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'reviewStatus',
			header: 'Review Status',
			width: 140,
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
					row.preferredMethod.toLowerCase().includes(term) ||
					row.currentMethod.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// UKMEC category filter
			if (ukmecFilter && row.ukmecCategory !== parseInt(ukmecFilter)) {
				return false;
			}

			// Review status filter
			if (reviewFilter && row.reviewStatus !== reviewFilter) {
				return false;
			}

			// Preferred method filter
			if (methodFilter && row.preferredMethod !== methodFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		ukmecFilter = '';
		reviewFilter = '';
		methodFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || ukmecFilter !== '' || reviewFilter !== '' || methodFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Contraception Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with contraception assessment status</p>
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
						placeholder="NHS number, name, or method..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- UKMEC Category -->
				<div>
					<label for="ukmec-filter" class="mb-1 block text-sm font-medium text-gray-700">
						UKMEC Category
					</label>
					<select
						id="ukmec-filter"
						bind:value={ukmecFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each ukmecOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Review Status -->
				<div>
					<label for="review-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Review Status
					</label>
					<select
						id="review-filter"
						bind:value={reviewFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each reviewOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Method filter -->
				<div>
					<label for="method-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Preferred Method
					</label>
					<select
						id="method-filter"
						bind:value={methodFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each methodOptions as opt (opt.value)}
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
