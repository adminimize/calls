import { useQuery } from 'svelte-instantdb';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
    const query = useQuery('venues', { where: { id: params.id } });
    return { query };
}) satisfies PageLoad; 