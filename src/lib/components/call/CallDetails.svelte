<script lang="ts">
    import type { Schema } from '$lib/db';
    import DateInput from '../inputs/DateInput.svelte';
    import TimeInput from '../inputs/TimeInput.svelte';
    import LongTextInput from '../inputs/LongTextInput.svelte';
    import { tx } from '$lib/db';

    let { call } = $props<{
        call: Schema['calls'];
    }>();

    let startDate = $state(call?.startDate ?? '');
    let endDate = $state(call?.endDate ?? '');
    let startTime = $state(call?.startTime ?? '');
    let endTime = $state(call?.endTime ?? '');
    let notes = $state(call?.notes ?? '');
    let saving = $state(false);

    $effect(() => {
        if (call) {
            startDate = call.startDate;
            endDate = call.endDate;
            startTime = call.startTime;
            endTime = call.endTime;
            notes = call.notes;
        }
    });

    $effect(() => {
        if (!call) return;
        
        const hasChanges = 
            startDate !== call.startDate ||
            endDate !== call.endDate ||
            startTime !== call.startTime ||
            endTime !== call.endTime ||
            notes !== call.notes;

        if (hasChanges) {
            saving = true;
            tx.calls[call.id].update({
                startDate,
                endDate,
                startTime,
                endTime,
                notes
            }).then(() => {
                saving = false;
            });
        }
    });
</script>

<div class="space-y-6">
    <div class="grid grid-cols-2 gap-4">
        <DateInput
            bind:value={startDate}
            label="Start Date"
            id="start-date"
        />
        <DateInput
            bind:value={endDate}
            label="End Date"
            id="end-date"
        />
    </div>
    <div class="grid grid-cols-2 gap-4">
        <TimeInput
            bind:value={startTime}
            label="Start Time"
            id="start-time"
        />
        <TimeInput
            bind:value={endTime}
            label="End Time"
            id="end-time"
        />
    </div>
    <LongTextInput
        bind:value={notes}
        label="Notes"
        id="notes"
    />
    {#if saving}
        <p class="text-sm text-gray-500">Saving changes...</p>
    {/if}
</div> 