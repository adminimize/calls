<script lang="ts">
	import '../app.css';
	import { companyAuth } from '$lib/companyAuth';
	import type { User } from '@instantdb/core';

	let { children } = $props();

	const auth = companyAuth.useAuth();
</script>

{#if auth.current.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-lg">Loading...</div>
	</div>
{:else if auth.current.error}
	<div class="p-4 text-red-500">Error: {auth.current.error.message}</div>
{:else}
	<div class="flex min-h-screen flex-col">
		<div class="flex-grow">
			{@render children()}
		</div>
		<footer class="bg-gray-50 py-4">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex flex-col items-center justify-between space-y-4 text-sm text-gray-500 sm:flex-row sm:space-y-0">
					<div>© {new Date().getFullYear()} Adminimize Inc.</div>
					<div class="flex items-center space-x-4">
						<a href="https://creativecoop.ca" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700">Creative Coop</a>
						<span>•</span>
						<a href="https://adminimize.ca" target="_blank" rel="noopener noreferrer" class="hover:text-gray-700">adminimize.ca</a>
					</div>
					<div class="text-gray-400">Made with ❤️ in Waterloo Region</div>
				</div>
			</div>
		</footer>
	</div>
{/if}
