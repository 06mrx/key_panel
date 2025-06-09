<!-- src/lib/components/ConfirmationModal.svelte -->
<script lang="ts">
    import { browser } from '$app/environment';
    
    export let show = false;
    export let title = 'Konfirmasi';
    export let message: string;
    export let confirmText = 'Ya';
    export let cancelText = 'Batal';
    export let onConfirm: () => void;
    export let onCancel: () => void;
    export let type: 'danger' | 'warning' | 'info' = 'danger';

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape' && show) {
            onCancel();
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
            <div class="mb-4">
                <h3 class="text-lg font-medium text-gray-900 flex items-center">
                    {#if type === 'danger'}
                        <svg class="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    {:else if type === 'warning'}
                        <svg class="w-6 h-6 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    {:else}
                        <svg class="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    {/if}
                    {title}
                </h3>
                <p class="mt-2 text-sm text-gray-500">{message}</p>
            </div>
            <div class="flex justify-end space-x-3">
                <button
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    on:click={onCancel}
                >
                    {cancelText}
                </button>
                <button
                    class="{type === 'danger' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 
                           type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' : 
                           'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'} 
                           px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                    on:click={onConfirm}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
{/if} 