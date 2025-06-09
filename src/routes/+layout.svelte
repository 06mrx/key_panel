<script lang="ts">
	import '../app.css';
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow-lg">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<a href="/" class="text-2xl font-bold text-indigo-600">MyApp</a>
				</div>
				<!-- <div class="flex items-center space-x-4">
					<a href="/" class="text-gray-700 hover:text-indigo-600">Home</a>
					<a href="/about" class="text-gray-700 hover:text-indigo-600">About</a>
					<a href="/contact" class="text-gray-700 hover:text-indigo-600">Contact</a>
				</div> -->
			</div>
		</div>
	</nav>

	<!-- Page Content -->
	<main class="max-w-7xl mx-auto  py-8">
		<slot />
	</main>
</div>
