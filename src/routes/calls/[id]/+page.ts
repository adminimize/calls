import { db } from '$lib/db';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
    const query = db.useQuery('calls', { where: { id: params.id } });
    return { query };
}) satisfies PageLoad; 