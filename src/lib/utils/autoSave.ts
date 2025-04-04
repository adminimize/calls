import type { Writable } from 'svelte/store';
import { db, tx } from '$lib/db';

export type SaveStatus = 'saved' | 'saving' | 'error';

export interface AutoSaveConfig<T> {
    id: string;
    entity: string;
    fields: {
        [K in keyof T]: T[K];
    };
    originalValues: T;
    saveStatus: Writable<SaveStatus>;
}

export async function autoSave<T>(config: AutoSaveConfig<T>) {
    const { id, entity, fields, originalValues, saveStatus } = config;

    // Don't save if values haven't changed
    const hasChanges = Object.entries(fields).some(([key, value]) => {
        return value !== originalValues[key as keyof T];
    });

    if (!hasChanges) return;

    saveStatus.set('saving');
    try {
        await db.transact(
            tx[entity][id].update(fields)
        );
        saveStatus.set('saved');
    } catch (err) {
        console.error(`Error saving ${entity}:`, err);
        saveStatus.set('error');
    }
} 