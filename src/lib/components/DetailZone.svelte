<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import CompanyDetails from './company/CompanyDetails.svelte';
    
    let mounted = $state(false);
    
    onMount(() => {
        mounted = true;
    });

    // Log state changes
    $effect(() => {
        console.log('DetailZone - Page state:', page.state);
        console.log('DetailZone - Mounted status:', mounted);
    });
</script>

<div class="h-full bg-white/80 backdrop-blur-sm shadow-[inset_0_2px_20px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden border border-white/20">
    {#if mounted && page.state.selected}
        <CompanyDetails company={page.state.selected} />
    {:else}
        <div class="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd" />
                </svg>
            </div>
            <h3 class="text-lg font-medium mb-2">Select a company</h3>
            <p class="text-sm text-center max-w-sm text-gray-500">
                Click on a company from the list to view and edit its details in this panel.
            </p>
        </div>
    {/if}
</div>

<style>
    /* Add a subtle gradient background */
    div {
        background-image: linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
    }
</style> 