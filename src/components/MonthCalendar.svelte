<script lang="ts">
    // Import necessary utilities
    import { onMount } from 'svelte';
    
    // Props for the component
    const { events = [] } = $props();
    
    // State variables
    let currentDate = $state(new Date());
    let isDropdownOpen = $state(false);
    let isMobileMenuOpen = $state(false);
    
    // Derived values
    const currentMonthName = $derived(new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate));
    const currentYear = $derived(currentDate.getFullYear());
    const formattedCurrentMonth = $derived(`${currentMonthName} ${currentYear}`);
    
    // Calculate calendar days
    const calendarDays = $derived(getCalendarDays(currentDate));
    
    interface CalendarDay {
        date: Date;
        dayNumber: number;
        isCurrentMonth: boolean;
        isPreviousMonth: boolean;
        isNextMonth: boolean;
        isToday: boolean;
    }
    
    interface CalendarEvent {
        name: string;
        time: string;
    }
    
    function getCalendarDays(date: Date): CalendarDay[] {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Create date for first day of month
        const firstDayOfMonth = new Date(year, month, 1);
        // Get the day of the week for the first day (0-6, where 0 is Sunday)
        let firstDayWeekday = firstDayOfMonth.getDay();
        // Convert from Sunday-based (0-6) to Monday-based (0-6)
        firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
        
        // Get the last day of the month
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        
        // Get previous month's days needed to fill the first week
        const daysFromPrevMonth = firstDayWeekday;
        
        // Get the last day of the previous month
        const lastDayOfPrevMonth = new Date(year, month, 0).getDate();
        
        const days: CalendarDay[] = [];
        
        // Add days from previous month
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            const dayNumber = lastDayOfPrevMonth - i;
            const date = new Date(year, month - 1, dayNumber);
            days.push({
                date,
                dayNumber,
                isCurrentMonth: false,
                isPreviousMonth: true,
                isNextMonth: false,
                isToday: isSameDay(date, new Date())
            });
        }
        
        // Add days from current month
        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            days.push({
                date,
                dayNumber: i,
                isCurrentMonth: true,
                isPreviousMonth: false,
                isNextMonth: false,
                isToday: isSameDay(date, today)
            });
        }
        
        // Add days from next month to fill out the calendar grid (6 rows x 7 days)
        const totalDaysNeeded = 42; // 6 weeks, 7 days each
        const remainingDays = totalDaysNeeded - days.length;
        
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({
                date,
                dayNumber: i,
                isCurrentMonth: false,
                isPreviousMonth: false,
                isNextMonth: true,
                isToday: isSameDay(date, today)
            });
        }
        
        return days;
    }
    
    function isSameDay(date1: Date, date2: Date): boolean {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    function previousMonth() {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    }
    
    function nextMonth() {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    function goToToday() {
        currentDate = new Date();
    }
    
    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }
    
    function toggleMobileMenu() {
        isMobileMenuOpen = !isMobileMenuOpen;
    }
    
    // Mock function to get events for a day
    function getEventsForDay(date: Date): CalendarEvent[] {
        // This would normally access the passed events prop and filter for the specific date
        // For now, return a mock for a few dates
        const dateStr = date.toISOString().split('T')[0];
        
        // Mock data for demonstration
        const mockEvents: Record<string, CalendarEvent[]> = {
            '2023-06-03': [
                { name: 'Design review', time: '10AM' },
                { name: 'Sales meeting', time: '2PM' }
            ],
            '2023-06-07': [
                { name: 'Date night', time: '6PM' }
            ],
            '2023-06-12': [
                { name: 'Sam\'s birthday party', time: '2PM' }
            ],
            '2023-06-22': [
                { name: 'Maple syrup museum', time: '3PM' },
                { name: 'Hockey game', time: '7PM' }
            ],
            '2023-07-04': [
                { name: 'Cinema with friends', time: '9PM' }
            ]
        };
        
        return mockEvents[dateStr] || [];
    }
</script>

<div class="lg:flex lg:h-full lg:flex-col">
  <header class="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
    <h1 class="text-base font-semibold text-gray-900">
      <time datetime={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}>
        {formattedCurrentMonth}
      </time>
    </h1>
    <div class="flex items-center">
      <div class="relative flex items-center rounded-md bg-white shadow-xs md:items-stretch">
        <button 
          type="button" 
          onclick={previousMonth}
          class="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
        >
          <span class="sr-only">Previous month</span>
          <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
            <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
          </svg>
        </button>
        <button 
          type="button" 
          onclick={goToToday}
          class="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block"
        >
          Today
        </button>
        <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden"></span>
        <button 
          type="button" 
          onclick={nextMonth}
          class="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
        >
          <span class="sr-only">Next month</span>
          <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
            <path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="hidden md:ml-4 md:flex md:items-center">
        <div class="relative">
          <button 
            type="button" 
            onclick={toggleDropdown}
            class="flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50" 
            id="menu-button" 
            aria-expanded={isDropdownOpen} 
            aria-haspopup="true"
          >
            Month view
            <svg class="-mr-1 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
              <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </button>

          {#if isDropdownOpen}
          <div class="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
            <div class="py-1" role="none">
              <!-- Active: "bg-gray-100 text-gray-900 outline-hidden", Not Active: "text-gray-700" -->
              <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-item-0">Day view</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-item-1">Week view</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 bg-gray-100" role="menuitem" tabindex="-1" id="menu-item-2">Month view</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-item-3">Year view</a>
            </div>
          </div>
          {/if}
        </div>
        <div class="ml-6 h-6 w-px bg-gray-300"></div>
        <button type="button" class="ml-6 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">Add event</button>
      </div>
      <div class="relative ml-6 md:hidden">
        <button 
          type="button" 
          onclick={toggleMobileMenu}
          class="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500" 
          id="menu-0-button" 
          aria-expanded={isMobileMenuOpen} 
          aria-haspopup="true"
        >
          <span class="sr-only">Open menu</span>
          <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
            <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
          </svg>
        </button>

        {#if isMobileMenuOpen}
        <div class="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden" role="menu" aria-orientation="vertical" aria-labelledby="menu-0-button" tabindex="-1">
          <div class="py-1" role="none">
            <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-0-item-0">Create event</a>
          </div>
          <div class="py-1" role="none">
            <a href="#" onclick={goToToday} class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-0-item-1">Go to today</a>
          </div>
          <div class="py-1" role="none">
            <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-0-item-2">Day view</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-0-item-3">Week view</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700 bg-gray-100" role="menuitem" tabindex="-1" id="menu-0-item-4">Month view</a>
            <a href="#" class="block px-4 py-2 text-sm text-gray-700" role="menuitem" tabindex="-1" id="menu-0-item-5">Year view</a>
          </div>
        </div>
        {/if}
      </div>
    </div>
  </header>
  <div class="ring-1 shadow-sm ring-black/5 lg:flex lg:flex-auto lg:flex-col">
    <div class="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs/6 font-semibold text-gray-700 lg:flex-none">
      <div class="flex justify-center bg-white py-2">
        <span>M</span>
        <span class="sr-only sm:not-sr-only">on</span>
      </div>
      <div class="flex justify-center bg-white py-2">
        <span>T</span>
        <span class="sr-only sm:not-sr-only">ue</span>
      </div>
      <div class="flex justify-center bg-white py-2">
        <span>W</span>
        <span class="sr-only sm:not-sr-only">ed</span>
      </div>
      <div class="flex justify-center bg-white py-2">
        <span>T</span>
        <span class="sr-only sm:not-sr-only">hu</span>
      </div>
      <div class="flex justify-center bg-white py-2">
        <span>F</span>
        <span class="sr-only sm:not-sr-only">ri</span>
      </div>
      <div class="flex justify-center bg-white py-2">
        <span>S</span>
        <span class="sr-only sm:not-sr-only">at</span>
      </div>
      <div class="flex justify-center bg-white py-2">
        <span>S</span>
        <span class="sr-only sm:not-sr-only">un</span>
      </div>
    </div>
    <div class="flex bg-gray-200 text-xs/6 text-gray-700 lg:flex-auto">
      <div class="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
        <!-- Desktop calendar view -->
        {#each calendarDays as day, i}
        <div class={`relative px-3 py-2 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-500'}`}>
          {#if day.isToday}
            <time datetime={day.date.toISOString().split('T')[0]} class="flex size-6 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
              {day.dayNumber}
            </time>
          {:else}
            <time datetime={day.date.toISOString().split('T')[0]}>
              {day.dayNumber}
            </time>
          {/if}
          
          <!-- Events -->
          {#if getEventsForDay(day.date).length > 0}
            {@const dayEvents = getEventsForDay(day.date)}
            <ol class="mt-2">
              {#each dayEvents as event}
                <li>
                  <a href="#" class="group flex">
                    <p class="flex-auto truncate font-medium text-gray-900 group-hover:text-indigo-600">{event.name}</p>
                    <time datetime={`${day.date.toISOString().split('T')[0]}T${event.time.replace('AM', '').replace('PM', '')}`} class="ml-3 hidden flex-none text-gray-500 group-hover:text-indigo-600 xl:block">{event.time}</time>
                  </a>
                </li>
              {/each}
            </ol>
          {/if}
        </div>
        {/each}
      </div>
      
      <!-- Mobile calendar view -->
      <div class="isolate grid w-full grid-cols-7 grid-rows-6 gap-px lg:hidden">
        {#each calendarDays as day, i}
        <button 
          type="button" 
          class={`flex h-14 flex-col px-3 py-2 hover:bg-gray-100 focus:z-10 
                 ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'} 
                 ${day.isToday ? 'font-semibold text-indigo-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-500'}`}>
          
          <!-- Date indicator -->
          {#if day.isToday}
            <time datetime={day.date.toISOString().split('T')[0]} class="ml-auto">
              {day.dayNumber}
            </time>
          {:else}
            <time datetime={day.date.toISOString().split('T')[0]} class="ml-auto">
              {day.dayNumber}
            </time>
          {/if}
          
          <!-- Event indicators -->
          {#if getEventsForDay(day.date).length > 0}
            {@const dayEvents = getEventsForDay(day.date)}
            <span class="sr-only">{dayEvents.length} events</span>
            <span class="-mx-0.5 mt-auto flex flex-wrap-reverse">
              {#each dayEvents as event, eventIndex}
                <span class="mx-0.5 mb-1 size-1.5 rounded-full bg-gray-400"></span>
              {/each}
            </span>
          {/if}
        </button>
        {/each}
      </div>
    </div>
  </div>
  
  <!-- Mobile event list -->
  <div class="px-4 py-10 sm:px-6 lg:hidden">
    <ol class="divide-y divide-gray-100 overflow-hidden rounded-lg bg-white text-sm ring-1 shadow-sm ring-black/5">
      {#each Array.from({ length: 42 }, (_, i) => i).map(i => calendarDays[i]).filter(day => getEventsForDay(day.date).length > 0).flatMap(day => getEventsForDay(day.date).map(event => ({ day, event }))) as { day, event }}
        <li class="group flex p-4 pr-6 focus-within:bg-gray-50 hover:bg-gray-50">
          <div class="flex-auto">
            <p class="font-semibold text-gray-900">{event.name}</p>
            <time datetime={`${day.date.toISOString().split('T')[0]}T${event.time.replace('AM', '').replace('PM', '')}`} class="mt-2 flex items-center text-gray-700">
              <svg class="mr-2 size-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clip-rule="evenodd" />
              </svg>
              {event.time}
            </time>
          </div>
          <a href="#" class="ml-6 flex-none self-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 opacity-0 ring-1 shadow-xs ring-gray-300 ring-inset group-hover:opacity-100 hover:ring-gray-400 focus:opacity-100">
            Edit<span class="sr-only">, {event.name}</span>
          </a>
        </li>
      {/each}
    </ol>
  </div>
</div> 