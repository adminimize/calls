<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import CompanyDetails from './company/CompanyDetails.svelte';
    import CallDetails from './call/CallDetails.svelte';
    
    let mounted = $state(false);
    
    onMount(() => {
        mounted = true;
    });

    // Log state changes
    $effect(() => {
        console.log('DetailZone - Page state changed:', page.state);
        console.log('DetailZone - Mounted:', mounted);
    });
</script>

<div class="h-full bg-white shadow-lg rounded-lg overflow-hidden">
    {#if mounted && page.state.selected}
        {#if page.state.selected.icon}
            <CompanyDetails company={page.state.selected} />
        {:else if page.state.selected.date}
            <CallDetails call={page.state.selected} />
        {/if}
    {:else}
        <div class="flex items-center justify-center h-full text-gray-500">
            <p>Select an item to view details</p>
        </div>
    {/if}
</div>

<style>
    /* Add a subtle gradient background */
    div {
        background-image: linear-gradient(to bottom right, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
    }
</style> 