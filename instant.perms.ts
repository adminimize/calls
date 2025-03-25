// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/core';

// Use a simple, open permissions model for development
const rules = {
	// Allow all operations by default
	"$default": {
		"allow": {
			"$default": "true"
		}
	},
	// Allow creating new types of data
	"attrs": {
		"allow": {
			"create": "true"
		}
	}
} satisfies InstantRules;

export default rules;
