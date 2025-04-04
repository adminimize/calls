<script lang="ts">
    import { autoSave, type SaveStatus as SaveStatusType } from '$lib/utils/autoSave';
    import { writable } from 'svelte/store';
    import SaveStatus from '../SaveStatus.svelte';
    
    let { 
        entity,
        entityId,
        data,
        originalData,
        className = "space-y-6 bg-gray-50 rounded-2xl p-8 shadow-inner"
    } = $props<{
        entity: string;
        entityId: string;
        data: Record<string, any>;
        originalData: Record<string, any>;
        className?: string;
    }>();
    
    let saveStatus = writable<SaveStatusType>('saved');
    
    function handleSave(key: string, value: any) {
        const fields = { [key]: value ?? null };
        const originalValues = { [key]: originalData[key] ?? null };
        
        autoSave({
            id: entityId,
            entity,
            fields,
            originalValues,
            saveStatus
        });
    }
</script>

<div class="relative">
    <SaveStatus status={$saveStatus} />
    
    <div class={className}>
        <slot {handleSave} />
    </div>
</div> 