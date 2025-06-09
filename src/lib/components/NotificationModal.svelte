<!-- src/lib/components/NotificationModal.svelte -->
<script lang="ts">
    import { browser } from '$app/environment';
    
    export let show = false;
    export let message: string;
    export let type: 'success' | 'error' | 'info' = 'info';
    export let onClose: () => void;

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && show) {
            onClose();
        }
    }

    $: if (browser && show) {
        document.addEventListener('keydown', handleKeydown);
    } else if (browser) {
        document.removeEventListener('keydown', handleKeydown);
    }
</script>

{#if show}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30">
        <div 
            class="bg-white/90 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-200"
            role="dialog"
            aria-modal="true"
        >
            <div class="flex items-center mb-4">
                {#if type === 'success'}
                    <div class="flex-shrink-0 w-8 h-8 mr-3">
                        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                {:else if type === 'error'}
                    <div class="flex-shrink-0 w-8 h-8 mr-3">
                        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                {:else}
                    <div class="flex-shrink-0 w-8 h-8 mr-3">
                        <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                {/if}
                <div class="flex-1">
                    <p class="text-sm text-gray-700">{message}</p>
                </div>
            </div>
            <div class="flex justify-end">
                <button
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    on:click={onClose}
                >
                    Tutup
                </button>
            </div>
        </div>
    </div>
{/if} 