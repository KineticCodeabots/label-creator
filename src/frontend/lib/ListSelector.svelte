<script>
	let firstOptionSelected = false;
	export let lists = ["one", "two", "three"];
	export let selectedList;
</script>

<select
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
