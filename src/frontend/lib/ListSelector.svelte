<script>
	let firstOptionSelected = false;
	export let lists = ["one", "two", "three"];
	export let selectedList;
</script>

<select
	class="print-hide"
	id="list-select"
	on:change={() => (firstOptionSelected = true)}
	bind:value={selectedList}
>
	{#if !firstOptionSelected}
		<option value="" disabled selected>Select a list</option>
	{/if}
	{#each lists as list}
		<option value={list}>{list}</option>
	{/each}
</select>

<style>
	#list-select {
		min-width: 100px;
		padding: 8px;
		font-size: 16px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	#list-select:focus {
		border-color: #007bff;
		outline: none;
		box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
	}
</style>
