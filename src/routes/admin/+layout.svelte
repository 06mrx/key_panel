<!-- src/routes/admin/+layout.svelte -->
<script lang="ts">
    import type { LayoutData } from './$types';

    export let data: LayoutData;

    let isMenuOpen = false;
    let menuButtonRef: HTMLButtonElement;
    let menuRef: HTMLDivElement;

    // Handle click outside menu
    function handleClickOutside(event: MouseEvent) {
        if (isMenuOpen && 
            menuRef && 
            menuButtonRef && 
            !menuRef.contains(event.target as Node) && 
            !menuButtonRef.contains(event.target as Node)) {
            isMenuOpen = false;
        }
    }

    async function handleLogout() {
        try {
            // Clear sessionStorage
            sessionStorage.clear();
            localStorage.clear();
            
            // Call logout endpoint to clear cookie
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                window.location.href = '/login';
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: redirect to login even if request fails
            window.location.href = '/login';
        }
    }

    $: currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Add event listener on mount
    import { onMount } from 'svelte';
    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });
</script>

<div class="min-h-screen bg-gray-100">
    <!-- Navbar -->
    <nav class="bg-white shadow-sm">
        <div class="w-full px-2 sm:px-4 md:px-6">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <div class="flex-shrink-0 flex items-center space-x-2 sm:space-x-4">
                        <a href="/admin" class="text-lg sm:text-xl font-bold text-indigo-600 no-underline">Admin Panel</a>
                        <!-- Menu Dropdown -->
                        <div class="relative">
                            <button
                                bind:this={menuButtonRef}
                                class="inline-flex items-center px-2 sm:px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition"
                                on:click={() => isMenuOpen = !isMenuOpen}
                            >
                                <span>Menu</span>
                                <svg class="ml-1 sm:ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </button>

                            {#if isMenuOpen}
                                <div
                                    bind:this={menuRef}
                                    class="menu-dropdown origin-top-right absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                                >
                                    <a
                                        href="/admin/users"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline {currentPath === '/admin/users' ? 'bg-gray-100' : ''}"
                                        on:click={() => isMenuOpen = false}
                                    >
                                        Users
                                    </a>
                                    <a
                                        href="/admin/customers"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline {currentPath === '/admin/customers' ? 'bg-gray-100' : ''}"
                                        on:click={() => isMenuOpen = false}
                                    >
                                        Customers
                                    </a>
                                    <a
                                        href="/admin/failed-auth"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline {currentPath === '/admin/failed-auth' ? 'bg-gray-100' : ''}"
                                        on:click={() => isMenuOpen = false}
                                    >
                                        Failed Auth Log
                                    </a>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
                <div class="flex items-center">
                    <button 
                        on:click={handleLogout}
                        class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Content -->
    <main class="py-4 sm:py-6">
        <div class="px-2 sm:px-4 md:px-6">
            <slot />
        </div>
    </main>
</div>

<style lang="postcss">
    /* Tambahkan animasi untuk dropdown */
    .menu-dropdown {
        animation: slideDown 0.1s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style> 