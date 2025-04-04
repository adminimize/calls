<script lang="ts">
    import type { Schema } from '$lib/db';
    import { db, tx } from '$lib/db';
    import DatePicker from '../DatePicker.svelte';
    import LongTextInput from '../inputs/LongTextInput.svelte';
    import SaveStatus from '../SaveStatus.svelte';
    import { CalendarDate } from "@internationalized/date";
    import type { DateValue } from "@internationalized/date";
    import { autoSave, type SaveStatus as SaveStatusType } from '$lib/utils/autoSave';
    import { writable } from 'svelte/store';

    let { call } = $props<{
        call: Schema['calls'];
    }>();

    let name = $state(call?.name ?? '');
    let date = $state<DateValue | undefined>(undefined);
    let notes = $state(call?.notes ?? '');
    let saveStatus = writable<SaveStatusType>('saved');

    // Reset form values when call changes
    $effect(() => {
        if (call) {
            name = call.name ?? '';
            if (call.date) {
                date = new CalendarDate(
                    parseInt(call.date.split('-')[0]),
                    parseInt(call.date.split('-')[1]),
                    parseInt(call.date.split('-')[2])
                );
            }
            notes = call.notes ?? '';
        }
    });

    // Save when values change
    $effect(() => {
        if (!call) return;
        
        autoSave({
            id: call.id,
            entity: 'simpleCalls',
            fields: {
                name,
                date: date?.toString() ?? '',
                notes: notes || null
            },
            originalValues: {
                name: call.name ?? '',
                date: call.date ?? '',
                notes: call.notes ?? ''
            },
            saveStatus
        });
    });
</script>

<div class="space-y-6 p-8">
    <SaveStatus status={$saveStatus} />

    <div class="space-y-6 bg-gray-50 rounded-2xl p-8 shadow-inner">
        <div class="space-y-4">
            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    id="name"
                    bind:value={name}
                    class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                />
            </div>

            <DatePicker
                value={date}
                onValueChange={(newDate) => date = newDate}
                label="Date"
            />

            <LongTextInput
                bind:value={notes}
                label="Notes"
                id="notes"
            />
        </div>
    </div>
</div> 