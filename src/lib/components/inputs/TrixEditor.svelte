<script lang="ts">
    import { browser } from '$app/environment';
    import { autoSave, type SaveStatus as SaveStatusType } from '$lib/utils/autoSave';
    import { writable, type Writable } from 'svelte/store';
    import { Toolbar, Separator } from 'bits-ui';
    import TextBold from 'phosphor-svelte/lib/TextB';
    import TextItalic from 'phosphor-svelte/lib/TextItalic';
    import ListBullets from 'phosphor-svelte/lib/ListBullets';
    import ListNumbers from 'phosphor-svelte/lib/ListNumbers';
    import ArrowCounterClockwise from 'phosphor-svelte/lib/ArrowCounterClockwise';
    import ArrowClockwise from 'phosphor-svelte/lib/ArrowClockwise';
    
    let { 
        value = $bindable(''),
        fieldName,
        entity,
        entityId,
        originalValue = '',
        label,
        placeholder = '',
        saveStatus = writable<SaveStatusType>('saved'),
        elementId = crypto.randomUUID(),
        onchange
    } = $props<{
        value: string;
        fieldName: string;
        entity: string;
        entityId: string;
        originalValue?: string;
        label?: string;
        placeholder?: string;
        saveStatus?: Writable<SaveStatusType>;
        elementId?: string;
        onchange?: (value: string) => void;
    }>();
    
    let editorElement = $state<HTMLElement | null>(null);
    let toolbarId = `toolbar-${elementId}`;
    let activeFormats = $state<string[]>([]);
    let debugValue = $state('');
    let debugFormats = $state<string[]>([]);

    console.log('TrixEditor', {
        value,
        fieldName,
        entity,
        entityId,
        originalValue
    });
    
    // Initialize Trix
    $effect(() => {
        if (browser) {
            import('trix')
                .then(() => {
                    if (editorElement) {
                        editorElement.addEventListener('trix-change', handleTrixChange);
                        editorElement.addEventListener('trix-selection-change', () => {
                            const editor = (editorElement as any).editor;
                            if (!editor) return;
                            
                            const newFormats: string[] = [];
                            if (editor.attributeIsActive('bold')) newFormats.push('bold');
                            if (editor.attributeIsActive('italic')) newFormats.push('italic');
                            activeFormats = newFormats;
                            debugFormats = newFormats;
                        });
                    }
                })
                .catch((error) => {
                    console.error('Error loading Trix:', error);
                });

            return () => {
                if (editorElement) {
                    editorElement.removeEventListener('trix-change', handleTrixChange);
                }
            };
        }
    });
    
    // Watch for value changes
    $effect(() => {
        if (!editorElement) return;
        const editor = (editorElement as any).editor;
        if (!editor) return;
        
        if (value !== editor.getDocument().toString()) {
            editor.loadHTML(value || '');
        }
    });
    
    function handleTrixChange() {
        if (!editorElement) return;
        const editor = (editorElement as any).editor;
        if (!editor) return;
        
        const newValue = editor.getDocument().toString();
        value = newValue;
        debugValue = newValue;
        
        // Call the parent's onchange handler if provided
        if (onchange) {
            onchange(newValue);
        }
        
        // Save to database
        const fields = { [fieldName]: newValue || null };
        const originalValues = { [fieldName]: originalValue };
        
        autoSave({
            id: entityId,
            entity,
            fields,
            originalValues,
            saveStatus
        });
    }
    
    function handleBitsToolbarChange(formats: string[]) {
        if (!editorElement) return;
        const editor = (editorElement as any).editor;
        if (!editor) return;
        
        // Check for each format if it was added or removed
        const wasActive = new Set(activeFormats);
        const isActive = new Set(formats);
        
        // Apply formats that were added
        for (const format of formats) {
            if (!wasActive.has(format)) {
                editor.activateAttribute(format);
            }
        }
        
        // Remove formats that were removed
        for (const format of activeFormats) {
            if (!isActive.has(format)) {
                editor.deactivateAttribute(format);
            }
        }
        
        activeFormats = formats;
    }
    
    function formatList(attribute: string) {
        if (!editorElement) return;
        const editor = (editorElement as any).editor;
        if (!editor) return;
        
        if (editor.attributeIsActive(attribute)) {
            editor.deactivateAttribute(attribute);
        } else {
            if (attribute === 'bullet') editor.deactivateAttribute('number');
            if (attribute === 'number') editor.deactivateAttribute('bullet');
            editor.activateAttribute(attribute);
        }
    }
    
    function performAction(action: string) {
        if (!editorElement) return;
        const editor = (editorElement as any).editor;
        if (!editor) return;
        
        if (action === 'undo') editor.undo();
        if (action === 'redo') editor.redo();
    }
</script>

<div>
    {#if label}
        <label for={elementId} class="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {/if}
    
    {#if browser}
        <div class="rich-editor-container rounded-xl overflow-hidden border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <input id={elementId} type="hidden" value={value} />
            
            <Toolbar.Root class="flex items-center bg-gray-50 border-b border-gray-300 p-1.5 overflow-x-auto">
                <Toolbar.Group 
                    type="multiple" 
                    bind:value={activeFormats}
                    onValueChange={handleBitsToolbarChange}
                    class="flex items-center gap-x-1"
                >
                    <Toolbar.GroupItem 
                        value="bold" 
                        aria-label="Bold" 
                        class="p-1.5 rounded hover:bg-gray-200 data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700"
                    >
                        <TextBold size={16} />
                    </Toolbar.GroupItem>
                    
                    <Toolbar.GroupItem 
                        value="italic" 
                        aria-label="Italic" 
                        class="p-1.5 rounded hover:bg-gray-200 data-[state=on]:bg-indigo-100 data-[state=on]:text-indigo-700"
                    >
                        <TextItalic size={16} />
                    </Toolbar.GroupItem>
                </Toolbar.Group>
                
                <Separator.Root class="mx-2 w-px h-6 bg-gray-300" />
                
                <div class="flex items-center gap-x-1">
                    <Toolbar.Button 
                        aria-label="Bullet List" 
                        class="p-1.5 rounded hover:bg-gray-200"
                        onclick={() => formatList('bullet')}
                    >
                        <ListBullets size={16} />
                    </Toolbar.Button>
                    
                    <Toolbar.Button 
                        aria-label="Numbered List" 
                        class="p-1.5 rounded hover:bg-gray-200"
                        onclick={() => formatList('number')}
                    >
                        <ListNumbers size={16} />
                    </Toolbar.Button>
                </div>
                
                <Separator.Root class="mx-2 w-px h-6 bg-gray-300" />
                
                <div class="flex items-center gap-x-1">
                    <Toolbar.Button 
                        aria-label="Undo" 
                        class="p-1.5 rounded hover:bg-gray-200"
                        onclick={() => performAction('undo')}
                    >
                        <ArrowCounterClockwise size={16} />
                    </Toolbar.Button>
                    
                    <Toolbar.Button 
                        aria-label="Redo" 
                        class="p-1.5 rounded hover:bg-gray-200"
                        onclick={() => performAction('redo')}
                    >
                        <ArrowClockwise size={16} />
                    </Toolbar.Button>
                </div>
            </Toolbar.Root>
            
            <trix-editor 
                input={elementId}
                bind:this={editorElement}
                placeholder={placeholder}
                class="trix-content min-h-[150px] p-3 text-sm focus:outline-none"
                onchange={handleTrixChange}
            ></trix-editor>

            <!-- Debug section -->
            <div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Debug View</h3>
                <div class="text-xs font-mono whitespace-pre-wrap break-all">
                    <div class="mb-2">
                        <span class="font-semibold">Current Value:</span>
                        <pre class="mt-1">{debugValue}</pre>
                    </div>
                    <div class="mb-2">
                        <span class="font-semibold">Original Value:</span>
                        <pre class="mt-1">{originalValue}</pre>
                    </div>
                    <div>
                        <span class="font-semibold">Active Formats:</span>
                        <pre class="mt-1">{JSON.stringify(debugFormats, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="border border-gray-300 rounded-xl p-3 min-h-[150px] bg-gray-50">
            <div class="animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2.5"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2.5"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(.trix-content) {
        line-height: 1.5 !important;
        min-height: 150px !important;
    }
    
    :global(.trix-content h1) {
        font-size: 1.25rem !important;
        line-height: 1.75rem !important;
        margin-bottom: 0.5rem !important;
        font-weight: 600 !important;
    }
    
    :global(.trix-content blockquote) {
        border-left: 3px solid #e5e7eb !important;
        padding-left: 0.75rem !important;
        color: #6b7280 !important;
    }
    
    :global(.trix-content pre) {
        background: #f3f4f6 !important;
        padding: 0.5rem !important;
        border-radius: 0.375rem !important;
        overflow-x: auto !important;
    }
    
    :global(.trix-content ul) {
        list-style-type: disc !important;
        padding-left: 1.5rem !important;
    }
    
    :global(.trix-content ol) {
        list-style-type: decimal !important;
        padding-left: 1.5rem !important;
    }

    /* Hide all trix toolbars */
    :global(trix-toolbar) {
        display: none !important;
    }
    
    /* Make sure no trix toolbar is ever displayed */
    :global(.trix-button-row) {
        display: none !important;
    }
</style> 