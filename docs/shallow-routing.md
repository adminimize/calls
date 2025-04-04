# Shallow Routing and Component Organization

This document outlines our approach to handling shallow routing and component organization in the application.

## Overview

We use a combination of shallow routing and component composition to create a seamless user experience that works both in a split-pane view (like the playground) and as standalone pages. This approach allows us to:

1. Maintain consistent UI between direct navigation and embedded views
2. Share components and logic between different contexts
3. Provide a smooth user experience with minimal page reloads
4. Keep the codebase DRY and maintainable

## Component Structure

### 1. Reusable Components (`/lib/components/`)

These are the building blocks that can be used anywhere in the application:

```
lib/
  components/
    company/
      CompanyDetails.svelte  # Main company display/edit component
    chips/
      CompanyChip.svelte     # Company chip for lists
    DetailZone.svelte        # Container for detail views
```

### 2. Route Components (`/routes/`)

These handle the routing and data loading:

```
routes/
  companies/
    +layout.svelte          # Common layout for company pages
    [id]/
      +page.ts             # Data loading
      +page.svelte         # Company page component
  playground/
    +page.svelte           # Split-pane view
```

## Shallow Routing Implementation

### 1. State Management

We use SvelteKit's `page` store to manage state between routes:

```typescript
// In the list view (e.g., playground)
async function handleCompanyClick(e: MouseEvent, company: any) {
    // Prevent default navigation for shallow routing
    e.preventDefault();
    
    // Preload the data
    const result = await preloadData(href);
    
    if (result.type === 'loaded') {
        // Push state with serializable data
        pushState(href, {
            selected: {
                id: company.id,
                name: company.name,
                // ... other serializable properties
            }
        });
    }
}
```

### 2. Component Integration

Components are designed to work in both contexts:

```svelte
<!-- CompanyDetails.svelte -->
<script lang="ts">
    const { company, isEditing = false } = $props<{
        company: Company;
        isEditing?: boolean;
    }>();
</script>

<!-- Component implementation -->
```

```svelte
<!-- [id]/+page.svelte -->
<script lang="ts">
    const { data } = $props();
    const query = data.company();
    
    // Use shallow routed data if available, otherwise use query data
    const company = $derived(
        page.state.selected || 
        query.current.data?.simpleCompanies?.[0]
    );
</script>

<CompanyDetails {company} />
```

### 3. Detail Zone Implementation

The DetailZone component acts as a container for detail views:

```svelte
<!-- DetailZone.svelte -->
<script lang="ts">
    import { page } from '$app/state';
    import CompanyDetails from './company/CompanyDetails.svelte';
    
    let mounted = $state(false);
</script>

<div class="h-full bg-white shadow-lg rounded-lg overflow-hidden">
    {#if mounted && page.state.selected}
        <CompanyDetails company={page.state.selected} />
    {:else}
        <div class="flex items-center justify-center h-full text-gray-500">
            <p>Select an item to view details</p>
        </div>
    {/if}
</div>
```

## Best Practices

1. **Component Design**
   - Make components context-agnostic
   - Use props for configuration
   - Keep state management at the appropriate level
   - Handle loading and error states consistently

2. **State Management**
   - Use shallow routing for split-pane views
   - Keep state serializable
   - Preload data when possible
   - Handle both direct navigation and shallow routing cases

3. **Data Flow**
   - Load data at the route level
   - Pass data down through props
   - Use derived stores for computed values
   - Handle updates through appropriate channels

4. **UI/UX Considerations**
   - Maintain consistent styling
   - Provide clear loading states
   - Handle errors gracefully
   - Support both mobile and desktop views

## Extending to Other Entities

This pattern can be extended to other entities (venues, events, etc.):

1. Create a reusable component in `/lib/components/`
2. Implement route components in `/routes/`
3. Add to the DetailZone component
4. Follow the same state management pattern

Example structure for venues:

```
lib/
  components/
    venue/
      VenueDetails.svelte
    chips/
      VenueChip.svelte
routes/
  venues/
    +layout.svelte
    [id]/
      +page.ts
      +page.svelte
```

## Common Pitfalls to Avoid

1. **State Serialization**
   - Only include serializable data in state
   - Handle complex objects appropriately
   - Consider data size and performance

2. **Component Context**
   - Don't assume component context
   - Handle both embedded and standalone cases
   - Test in different scenarios

3. **Data Loading**
   - Handle loading states consistently
   - Consider caching strategies
   - Implement proper error handling

4. **UI Consistency**
   - Maintain consistent styling
   - Handle responsive design
   - Consider accessibility 