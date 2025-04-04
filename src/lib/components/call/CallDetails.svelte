<script lang="ts">
    import type { Schema } from '$lib/db';
    import { db, tx } from '$lib/db';
    import DatePicker from '../DatePicker.svelte';
    import { CalendarDate } from "@internationalized/date";
    import type { DateValue } from "@internationalized/date";
    import SaveStatus from '../SaveStatus.svelte';
    import { writable } from 'svelte/store';
    import type { SaveStatus as SaveStatusType } from '$lib/utils/autoSave';
    import { autoSave } from '$lib/utils/autoSave';
    import TrixEditor from '../inputs/TrixEditor.svelte';
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    let { call } = $props<{
        call: {
            id: string;
            name: string;
            date?: string;
            notes?: string;
        };
    }>();


    console.log('CallDetails', {
        call
    });

    let name = $state(call?.name ?? '');
    let date = $state<DateValue | undefined>(undefined);
    let notes = $state(call?.notes ?? '');
    let saveStatus = writable<SaveStatusType>('saved');
    let initializing = $state(true);
    
    // Reset form values when call changes
    $effect(() => {
        if (call) {
            initializing = true;
            
            // Update the name, date, and notes with values from the call
            name = call.name ?? '';
            
            if (call.date) {
                date = new CalendarDate(
                    parseInt(call.date.split('-')[0]),
                    parseInt(call.date.split('-')[1]),
                    parseInt(call.date.split('-')[2])
                );
            } else {
                date = undefined;
            }
            
            notes = call.notes ?? '';
            
            // Reset initializing flag after a short delay to allow components to update
            setTimeout(() => {
                initializing = false;
            }, 200);
        }
    });
    
    function handleDateChange(newDate: DateValue | undefined) {
        if (!call || initializing) return;
        
        date = newDate;
        if (newDate) {
            const dateString = newDate.toString();
            
            // Save the date change
            autoSave({
                id: call.id,
                entity: 'simpleCalls',
                fields: { date: dateString },
                originalValues: { date: call.date ?? '' },
                saveStatus
            });
        }
    }
    
    function handleNameChange() {
        if (!call || initializing) return;
        
        autoSave({
            id: call.id,
            entity: 'simpleCalls',
            fields: { name },
            originalValues: { name: call.name ?? '' },
            saveStatus
        });
    }

    function handleNotesChange(newNotes: string) {
        if (!call || initializing) return;
        
        notes = newNotes;
        autoSave({
            id: call.id,
            entity: 'simpleCalls',
            fields: { notes: newNotes || null },
            originalValues: { notes: call.notes ?? '' },
            saveStatus
        });
    }
</script>

<div class="space-y-6 p-8">
    {#if call}
        <div class="relative">
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
                            oninput={handleNameChange}
                        />
                    </div>

                    <div>
                        <DatePicker
                            value={date}
                            onValueChange={handleDateChange}
                            label="Date"
                        />
                    </div>

                    <div>
                        <TrixEditor 
                            bind:value={notes}
                            fieldName="notes"
                            entity="simpleCalls"
                            entityId={call.id}
                            originalValue={call.notes ?? ''}
                            saveStatus={saveStatus}
                            label="Notes"
                            placeholder="Add notes about this call..."
                            onchange={handleNotesChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div> 