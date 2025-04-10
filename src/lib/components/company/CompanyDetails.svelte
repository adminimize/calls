<script lang="ts">
    import { db, tx } from '$lib/db';
    import { page } from '$app/state';
    import ShortTextInput from '../inputs/ShortTextInput.svelte';
    import LongTextInput from '../inputs/LongTextInput.svelte';
    import SaveStatus from '../SaveStatus.svelte';
    import { autoSave, type SaveStatus as SaveStatusType } from '$lib/utils/autoSave';
    import { writable } from 'svelte/store';

    const { company } = $props<{
        company: {
            id: string;
            name: string;
            description?: string;
            website?: string;
            icon?: { url: string };
            logo?: { url: string };
        };
    }>();

    let name = $state(company.name);
    let description = $state(company.description || '');
    let website = $state(company.website || '');
    let saveStatus = writable<SaveStatusType>('saved');

    // Reset form values when company changes
    $effect(() => {
        name = company.name;
        description = company.description || '';
        website = company.website || '';
    });

    // Save when values change
    $effect(() => {
        autoSave({
            id: company.id,
            entity: 'simpleCompanies',
            fields: {
                name,
                description: description || null,
                website: website || null,
            },
            originalValues: {
                name: company.name,
                description: company.description || '',
                website: company.website || ''
            },
            saveStatus
        });
    });

    // Handle file uploads
    async function handleFileUpload(type: 'icon' | 'logo', event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        
        saveStatus.set('saving');
        try {
            const path = `companies/${company.id}/${type}.png`;
            const { data: fileData } = await db.storage.uploadFile(path, file, {
                contentType: 'image/png'
            });
            
            await db.transact(
                tx.simpleCompanies[company.id].link({ [type]: fileData.id })
            );
            
            saveStatus.set('saved');
        } catch (err) {
            console.error(`Error uploading ${type}:`, err);
            saveStatus.set('error');
        }
    }
</script>

<div class="space-y-8 p-8">
    <SaveStatus status={$saveStatus} />

    <!-- Visual assets section -->
    <div class="grid grid-cols-2 gap-8">
        <!-- Icon -->
        <div class="space-y-3">
            <h3 class="text-sm font-medium text-gray-700">Company Icon</h3>
            <div class="flex items-center gap-4">
                <label class="relative group cursor-pointer">
                    {#if company.icon?.url}
                        <img
                            src={company.icon.url}
                            alt=""
                            class="w-20 h-20 rounded-2xl object-cover bg-gray-100 ring-2 ring-gray-200 transition-all duration-200 group-hover:ring-indigo-300"
                        />
                    {:else}
                        <div class="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 ring-2 ring-gray-200 transition-all duration-200 group-hover:ring-indigo-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    {/if}
                    <input
                        type="file"
                        accept="image/png"
                        on:change={(e) => handleFileUpload('icon', e)}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                </label>
            </div>
        </div>

        <!-- Logo -->
        <div class="space-y-3">
            <h3 class="text-sm font-medium text-gray-700">Company Logo</h3>
            <div class="flex items-center gap-4">
                <label class="relative group cursor-pointer">
                    {#if company.logo?.url}
                        <img
                            src={company.logo.url}
                            alt=""
                            class="h-20 max-w-xs object-contain bg-gray-100 rounded-2xl p-2 ring-2 ring-gray-200 transition-all duration-200 group-hover:ring-indigo-300"
                        />
                    {:else}
                        <div class="h-20 w-40 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 ring-2 ring-gray-200 transition-all duration-200 group-hover:ring-indigo-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd" />
                            </svg>
                        </div>
                    {/if}
                    <input
                        type="file"
                        accept="image/png"
                        on:change={(e) => handleFileUpload('logo', e)}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                </label>
            </div>
        </div>
    </div>

    <!-- Details section -->
    <div class="space-y-6 bg-gray-50 rounded-2xl p-8 shadow-inner">
        <div class="space-y-4">
            <ShortTextInput
                id="name"
                label="Company Name"
                bind:value={name}
                placeholder="Enter company name"
            />

            <LongTextInput
                id="description"
                label="Description"
                bind:value={description}
                placeholder="Enter company description"
            />

            <ShortTextInput
                id="website"
                label="Website"
                bind:value={website}
                placeholder="Enter company website"
            />
        </div>
    </div>
</div> 