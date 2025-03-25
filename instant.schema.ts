// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/core';

const _schema = i.schema({
	entities: {
		$users: i.entity({
			email: i.string().unique().indexed()
		}),
		companyProfiles: i.entity({
			companyName: i.string(),
			isCompanyAdmin: i.boolean(),
			userId: i.string().unique()
		}),
		technicians: i.entity({
			firstName: i.string(),
			lastName: i.string(),
			phone: i.string(),
			email: i.string(),
			verified: i.boolean(),
			createdAt: i.any()
		})
	},
	links: {
		userProfile: {
			forward: { on: 'companyProfiles', has: 'one', label: '$user' },
			reverse: { on: '$users', has: 'one', label: 'profile' }
		}
	},
	rooms: {}
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
