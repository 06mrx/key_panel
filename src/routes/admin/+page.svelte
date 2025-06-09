<!-- src/routes/admin/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
</script>

<div class="container mx-auto px-4 py-8">
    <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Users Card -->
            <a href="/admin/users" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow no-underline">
                <h2 class="text-xl font-semibold text-gray-800 mb-2">Users</h2>
                <p class="text-gray-600">Kelola pengguna sistem</p>
            </a>
            
            <!-- Customers Card -->
            <a href="/admin/customers" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow no-underline">
                <h2 class="text-xl font-semibold text-gray-800 mb-2">Customers</h2>
                <p class="text-gray-600">Lihat data pelanggan</p>
            </a>
            
            <!-- Failed Auth Log Card -->
            <a href="/admin/failed-auth" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow no-underline">
                <h2 class="text-xl font-semibold text-gray-800 mb-2">Failed Auth Log</h2>
                <p class="text-gray-600">Monitor percobaan login gagal</p>
            </a>
        </div>
    </div>
</div> 