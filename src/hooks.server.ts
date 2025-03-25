import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    // The auth state will be handled by InstantDB's client-side auth
    // We don't need to manually verify tokens on the server
    // InstantDB will handle this for us through their client SDK
    
    const response = await resolve(event);
    return response;
}; 