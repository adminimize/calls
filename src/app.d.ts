/// <reference types="svelte-clerk/env" />

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from '@instantdb/core';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			// Auth is handled by InstantDB client-side
		}
		// interface PageData {}
		interface PageState {
			selected?: any;
		}
		// interface Platform {}
	}

	// Add type declarations for trix custom elements
	interface HTMLElementTagNameMap {
		'trix-editor': any;
		'trix-toolbar': any;
	}
}

export {};
