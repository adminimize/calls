<script lang="ts">
    import { autoSave, type SaveStatus as SaveStatusType } from '$lib/utils/autoSave';
    import { writable, type Writable } from 'svelte/store';
    
    let { 
        value = $bindable(''),
        id,
        fieldName,
        entity,
        entityId,
        originalValue = '',
        label,
        placeholder = '',
        inputType = 'text',
        rows = 3,
        saveStatus = writable<SaveStatusType>('saved'),
    } = $props<{
        value: string;
        id: string;
        fieldName: string;
        entity: string;
        entityId: string;
        originalValue?: string;
        label?: string;
        placeholder?: string;
        inputType?: 'text' | 'textarea';
        rows?: number;
        saveStatus?: Writable<SaveStatusType>;
    }>();

    function handleInput() {
        const fields = { [fieldName]: value || null };
        const originalValues = { [fieldName]: originalValue };
        
        autoSave({
            id: entityId,
            entity,
            fields,
            originalValues,
            saveStatus
        });
    }
</script>

<div>
    {#if label}
        <label for={id} class="block text-sm font-medium text-gray-700">{label}</label>
    {/if}
    
    {#if inputType === 'textarea'}
        <textarea
            {id}
            bind:value
            {rows}
            class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
            {placeholder}
            oninput={handleInput}
        ></textarea>
    {:else}
        <input
            type="text"
            {id}
            bind:value
            class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
            {placeholder}
            oninput={handleInput}
        />
    {/if}
</div> 