<script lang="ts">
    import type { Schema } from '$lib/db';
    import ShortTextInput from '../inputs/ShortTextInput.svelte';
    import LongTextInput from '../inputs/LongTextInput.svelte';
    import BooleanInput from '../inputs/BooleanInput.svelte';
    import { tx } from '$lib/db';

    let { venue } = $props<{
        venue: Schema['venues'];
    }>();

    let name = $state(venue?.name ?? '');
    let capacity = $state(venue?.capacity ?? 0);
    let accessible = $state(venue?.accessible ?? false);
    let notes = $state(venue?.notes ?? '');
    let saving = $state(false);

    $effect(() => {
        if (venue) {
            name = venue.name;
            capacity = venue.capacity;
            accessible = venue.accessible;
            notes = venue.notes;
        }
    });

    $effect(() => {
        if (!venue) return;
        
        const hasChanges = 
            name !== venue.name ||
            capacity !== venue.capacity ||
            accessible !== venue.accessible ||
            notes !== venue.notes;

        if (hasChanges) {
            saving = true;
            tx.venues[venue.id].update({
                name,
                capacity,
                accessible,
                notes
            }).then(() => {
                saving = false;
            });
        }
    });
</script>

<div class="space-y-6">
    <ShortTextInput
        bind:value={name}
        label="Name"
        id="name"
    />
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label for="capacity" class="block text-sm font-medium text-gray-700">Capacity</label>
            <input
                type="number"
                id="capacity"
                bind:value={capacity}
                class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                min="0"
            />
        </div>
        <BooleanInput
            bind:value={accessible}
            label="Accessible"
            id="accessible"
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