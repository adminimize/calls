<script lang="ts">
    import { companyAuth } from '$lib/companyAuth';
    import { goto } from '$app/navigation';

    // Get auth 
    const auth = companyAuth.useAuth();
    
    // Auto-redirect if not authenticated
    const shouldRedirect = $derived(!auth.current.user && !auth.current.isLoading);
    
    if (shouldRedirect) {
        window.location.href = '/';
    }

    let { children } = $props();
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
    {@render children()}
{:else}
    <div class="flex min-h-screen items-center justify-center">
        <div class="text-gray-600">Redirecting to login...</div>
    </div>
{/if} 