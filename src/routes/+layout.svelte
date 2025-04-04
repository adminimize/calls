<script lang="ts">
	import '../app.css';
	import { companyAuth } from '$lib/companyAuth';
	import { db } from '$lib/db';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Toaster } from 'svelte-5-french-toast';
	import { Select } from "bits-ui";
	import { Check } from "phosphor-svelte";
	
	const auth = companyAuth.useAuth();
	// Get the current route path to highlight active nav items
	const currentPath = $derived(page.url.pathname);

	// Query for companies from the database
	const query = db.useQuery({
		companyProfiles: {
		},
	});

	// State for selected company
	let selectedCompanyId = $state<string | undefined>(undefined);

	// Share selected company ID with all routes through page data
	$effect(() => {
		if (page.data) {
			page.data.selectedCompanyId = selectedCompanyId;
		}
	});

	// Derived states for companies and dropdown items
	const companies = $derived(query.current.data?.companyProfiles || []);
	const companyItems = $derived(companies.map(company => ({
		value: company.id,
		label: company.companyName,
	})));

	// Set a default company when data is loaded
	$effect(() => {
		if (companies.length > 0 && !selectedCompanyId) {
			selectedCompanyId = companies[0].id;
		}
	});

	function handleSignOut() {
		companyAuth.signOut();
		goto('/');
	}
</script>

<Toaster />

{#if auth.current.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-gray-600">Loading...</div>
	</div>
{:else if auth.current.error}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-red-600">Error: {auth.current.error.message}</div>
	</div>
{:else if auth.current.user}
	<div class="min-h-screen bg-gray-50">
		<nav class="bg-white shadow">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 justify-between">
					<div class="flex">
						<div class="flex flex-shrink-0 items-center">
							<a href="/dashboard" 
							   class="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xl font-mono font-bold transition transform hover:scale-105 hover:shadow-md active:scale-95">
                <span class="font-black">Call</span><span class="font-extralight">board</span>
              </a>
						</div>
						{#if auth.current.user}
							<div class="ml-6 flex items-center space-x-4">
								<a href="/dashboard/technicians" 
								   class={`text-gray-500 hover:text-gray-700 pb-1 border-b-2 ${currentPath.includes('/technicians') ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}>
									Technicians
								</a>
								<a href="/dashboard/calendar" 
								   class={`text-gray-500 hover:text-gray-700 pb-1 border-b-2 ${currentPath.includes('/calendar') ? 'border-indigo-600 text-indigo-600' : 'border-transparent'}`}>
									Calendar
								</a>
							</div>
						{/if}
					</div>
					{#if auth.current.user}
						<div class="flex items-center">
							<div class="flex items-center gap-4">
								{#if companyItems.length > 0}
									<Select.Root 
										type="single" 
										bind:value={selectedCompanyId}
										items={companyItems}
									>
										<Select.Trigger
											class="inline-flex h-9 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-1 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											aria-label="Select a company"
										>
											{companyItems.find(item => item.value === selectedCompanyId)?.label || 'Select company'}
											<svg class="ml-1 h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
											</svg>
										</Select.Trigger>
										<Select.Portal>
											<Select.Content
												class="overflow-hidden rounded-md border border-gray-200 bg-white text-gray-700 shadow-md animate-in fade-in-80 zoom-in-95"
												sideOffset={5}
											>
												<Select.Viewport class="p-1">
													{#each companyItems as item (item.value)}
														<Select.Item
															value={item.value}
															label={item.label}
															class="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
														>
															{#snippet children({ selected })}
																<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
																	{#if selected}
																		<Check class="h-4 w-4" />
																	{/if}
																</span>
																<span>{item.label}</span>
															{/snippet}
														</Select.Item>
													{/each}
												</Select.Viewport>
											</Select.Content>
										</Select.Portal>
									</Select.Root>
								{/if}
								<span class="text-sm text-gray-700">{auth.current.user?.email}</span>
								<button
									onclick={handleSignOut}
									class="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
								>
									Sign out
								</button>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</nav>

		<slot />
	</div>
{:else}
	<slot />
{/if}
