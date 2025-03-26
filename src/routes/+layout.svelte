<script lang="ts">
	import '../app.css';
	import { companyAuth } from '$lib/companyAuth';
	import { goto } from '$app/navigation';

	const auth = companyAuth.useAuth();

	function handleSignOut() {
		companyAuth.signOut();
		goto('/');
	}
</script>

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
							<a href="/dashboard" class="text-xl font-bold text-gray-900">Callboard</a>
						</div>
						{#if auth.current.user}
							<div class="ml-6 flex items-center space-x-4">
								<a href="/dashboard" class="text-gray-500 hover:text-gray-700">Dashboard</a>
								<a href="/dashboard/technicians" class="text-gray-500 hover:text-gray-700">Technicians</a>
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
