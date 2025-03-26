import { init } from 'svelte-instantdb';
import { id } from '@instantdb/core';
import { PUBLIC_INSTANT_APP_ID } from '$env/static/public';
import schema from '../instant.schema';

// App ID for the InstantDB application
export const APP_ID = PUBLIC_INSTANT_APP_ID;

console.log("Initializing InstantDB with APP_ID:", APP_ID);
// console.log("Schema structure:", JSON.stringify(schema, null, 2));

// Initialize InstantDB client
export const db = init({
    appId: APP_ID,
    schema,
});

console.log("Database initialized:", !!db);
console.log("Database functions:", {
    hasTransact: !!db?.transact,
    hasTx: !!db?.tx,
    hasUseQuery: !!db?.useQuery
});

// LogDbStatus utility function
export function logDbStatus() {
  console.log("InstantDB Status:", {
    appId: APP_ID,
    isInitialized: !!db,
    hasTransact: !!db?.transact,
    hasTx: !!db?.tx,
    hasUseQuery: !!db?.useQuery,
    schema: !!schema
  });
}

// Import tx and id for use in our functions
import { tx } from 'svelte-instantdb';

/**
 * Add a technician to the database
 * This function should only be called from client components, not server code
 */
export async function addTechnician(data: any) {
  console.log("addTechnician called with data:", JSON.stringify(data, null, 2));
  
  try {
    // Generate an ID
    const techId = id();
    console.log("Generated ID:", techId);
    
    // Use the proper transaction format with tx helper
    const result = await db.transact(tx.technicians[techId].update(data));
    console.log("Transaction successful:", result);
    return { success: true, id: techId, result };
  } catch (err) {
    console.error("Error in addTechnician:", err);
    console.error("Error name:", err instanceof Error ? err.name : 'Unknown');
    console.error("Error message:", err instanceof Error ? err.message : String(err));
    console.error("Error stack:", err instanceof Error ? err.stack : 'Unknown');
    throw err;
  }
}

// Export commonly used utilities
export { tx, id } from 'svelte-instantdb'; 