<script lang="ts">
    import type { SaveStatus } from '$lib/utils/autoSave';

    let { status } = $props<{
        status: SaveStatus;
    }>();
</script>

<div class="absolute top-4 right-4 flex items-center gap-2 text-sm">
    {#if status === 'saving'}
        <div class="animate-pulse text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a7 7 0 00-7 7 1 1 0 11-2 0 9 9 0 1118 0 1 1 0 11-2 0 7 7 0 00-7-7z" clip-rule="evenodd" />
            </svg>
        </div>
    {:else if status === 'saved'}
        <div class="text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
        </div>
    {:else if status === 'error'}
        <div class="text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
        </div>
    {/if}
</div> 