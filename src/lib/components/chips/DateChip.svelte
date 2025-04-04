<script lang="ts">
    import type { DateValue } from "@internationalized/date";
    import { getRelativeTimeMessage } from "$lib/utils/dateUtils";
    import { copyToClipboard } from "$lib/utils/clipboard";
    import toast from 'svelte-5-french-toast';

    const { date } = $props<{
        date: DateValue;
    }>();

    const relativeMessage = $derived.by(() => getRelativeTimeMessage(date));

    // Format date based on whether it's in the current year
    function formatDate(date: DateValue): string {
        const jsDate = new Date(date.toString());
        const now = new Date();
        const isCurrentYear = jsDate.getFullYear() === now.getFullYear();
        
        if (isCurrentYear) {
            // Format as "Mon, April 7"
            return jsDate.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'long',
                day: 'numeric'
            });
        } else {
            // Format as "2025-04-07"
            return jsDate.toISOString().split('T')[0];
        }
    }

    // Get full formatted date for clipboard
    function getFullFormattedDate(date: DateValue): string {
        const jsDate = new Date(date.toString());
        return jsDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Get day name for non-current year dates
    function getDayName(date: DateValue): string {
        const jsDate = new Date(date.toString());
        return jsDate.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Determine if date is in current year
    const isCurrentYear = $derived(() => {
        const jsDate = new Date(date.toString());
        const now = new Date();
        return jsDate.getFullYear() === now.getFullYear();
    });

    // Handle click to copy
    async function handleClick() {
        const fullDate = getFullFormattedDate(date);
        const success = await copyToClipboard(fullDate);
        if (success) {
            toast.success('Date copied to clipboard');
        } else {
            toast.error('Failed to copy date');
        }
    }
</script>

<button 
    onclick={handleClick}
    class="group flex items-center w-[160px] rounded-lg bg-indigo-50/40 hover:bg-indigo-50/60 transition-colors"
>
    <div class="flex items-center justify-center h-full px-2 py-2 bg-gradient-to-r from-indigo-100/80 to-purple-100/80">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-indigo-600">
            <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
        </svg>
    </div>
    <div class="flex-1 min-w-0 px-2 py-1">
        <div class="text-sm font-medium text-indigo-900 truncate">
            {formatDate(date)}
        </div>
        <div class="text-[10px] text-indigo-600 truncate">
            {#if !isCurrentYear}
                <span class="font-medium">{getDayName(date)}</span>
                <span class="mx-1">|</span>
            {/if}
            <span class="italic">{relativeMessage}</span>
        </div>
    </div>
</button> 