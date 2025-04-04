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
		}),
		// Call entities
		calls: i.entity({
			title: i.string(),
			startTime: i.string(),
			endTime: i.string(),
			status: i.string(),
			createdAt: i.string(),
			updatedAt: i.string()
		}),
		simpleCalls: i.entity({
			name: i.string(),
			date: i.string(),
			createdAt: i.string()
		}),
		callRoles: i.entity({
			quantity: i.number(),
			notes: i.string(),
			isGlobalRole: i.boolean()
		}),
		globalRoles: i.entity({
			name: i.string(),
			type: i.string()
		}),
		// Venue entity
		venues: i.entity({
			name: i.string(),
			createdAt: i.string()
		}),
		// Simple company entity
		simpleCompanies: i.entity({
			name: i.string(),
			description: i.string(),
			website: i.string(),
			createdAt: i.string()
		}),
		$files: i.entity({
			path: i.string().unique().indexed(),
			url: i.string()
		})
	},
	links: {
		userProfile: {
			forward: { on: 'companyProfiles', has: 'one', label: '$user' },
			reverse: { on: '$users', has: 'one', label: 'profile' }
		},
		// Call links
		callCreator: {
			forward: { on: 'calls', has: 'one', label: 'creator' },
			reverse: { on: '$users', has: 'many', label: 'createdCalls' }
		},
		callCompany: {
			forward: { on: 'calls', has: 'one', label: 'company' },
			reverse: { on: 'companyProfiles', has: 'many', label: 'calls' }
		},
		callRoleAssignment: {
			forward: { on: 'callRoles', has: 'one', label: 'call' },
			reverse: { on: 'calls', has: 'many', label: 'roles' }
		},
		callRoleGlobalRole: {
			forward: { on: 'callRoles', has: 'one', label: 'globalRole' },
			reverse: { on: 'globalRoles', has: 'many', label: 'callRoles' }
		},
		companyIcon: {
			forward: { on: 'simpleCompanies', has: 'one', label: 'icon' },
			reverse: { on: '$files', has: 'one', label: 'company' }
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
