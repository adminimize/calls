# Dynamic Date Handling in Callboard

This document outlines our approach to handling and displaying dates throughout the Callboard application.

## Core Technologies

- **@internationalized/date**: Used for robust date manipulation and timezone handling
- **Svelte 5 Reactivity**: Leveraging `$derived.by` for reactive date calculations
- **Bits UI DatePicker**: Modern, accessible date selection component

## Components

### DatePicker Component

Our custom DatePicker combines several features:
- Clean, modern UI with gradient backgrounds
- Inline relative date context (e.g., "tomorrow", "in 2 days")
- Keyboard accessible navigation
- Real-time date validation

```svelte
<DatePicker
    label="Call Date"
    value={selectedDate}
    onValueChange={handleDateSelect}
/>
```

### DateChip Component

A sophisticated date display component that adapts its format based on context:

#### Current Year Dates
- Format: `Mon, April 7`
- Relative context stacked below: `in 2 days`
```
┌─────────────────┐
│ Mon, April 7    │
│ in 2 days       │
└─────────────────┘
```

#### Future Year Dates
- Format: `2025-04-07`
- Extended context: `Monday | in one year`
```
┌─────────────────┐
│ 2025-04-07      │
│ Monday | in 1y   │
└─────────────────┘
```

## Date Utils

Our `dateUtils.ts` provides consistent date handling across the application:

- `getRelativeTimeMessage()`: Generates human-readable relative time strings
- `parseDate()`: Converts various date formats to `CalendarDate`
- Date comparison and formatting utilities

## Best Practices

1. **Consistent Storage**: Always store dates in ISO format (YYYY-MM-DD)
2. **Display Flexibility**: Use contextual formatting for user display
3. **Reactive Updates**: Leverage Svelte 5's reactivity for real-time updates
4. **Accessibility**: Ensure all date components are keyboard navigable and screen-reader friendly

## Example Usage

```svelte
<script>
    import DateChip from "$lib/components/DateChip.svelte";
    import { parseDate } from "@internationalized/date";

    const callDate = parseDate("2024-04-07");
</script>

<DateChip date={callDate} />
```

## Future Improvements

- [ ] Add timezone support for international calls
- [ ] Implement date range selection for multi-day calls
- [ ] Add calendar view integration
- [ ] Support for recurring dates 