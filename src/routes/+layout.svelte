<script lang="ts">
	import '../app.css';
	import { companyAuth } from '$lib/companyAuth';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Toaster } from 'svelte-5-french-toast';
	
	const auth = companyAuth.useAuth();
	// Get the current route path to highlight active nav items
	const currentPath = $derived(page.url.pathname);

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
