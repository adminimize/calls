<script lang="ts">
    import { autoSave, type SaveStatus as SaveStatusType } from '$lib/utils/autoSave';
    import { writable, type Writable } from 'svelte/store';
    
    let { 
        value = $bindable(''),
        fieldName,
        entity,
        entityId,
        originalValue = '',
        saveStatus = writable<SaveStatusType>('saved')
    } = $props<{
        value: string;
        fieldName: string;
        entity: string;
        entityId: string;
        originalValue?: string;
        saveStatus?: Writable<SaveStatusType>;
    }>();

    // Watch value changes to trigger save
    $effect(() => {
        const fields = { [fieldName]: value || null };
        const originalValues = { [fieldName]: originalValue };
        
        // Don't save if values haven't changed
        const hasChanges = Object.entries(fields).some(([key, val]) => {
            return val !== originalValues[key as keyof typeof originalValues];
        });
        
        if (!hasChanges) return;
        
        autoSave({
            id: entityId,
            entity,
            fields,
            originalValues,
            saveStatus
        });
    });
</script>

<slot /> 