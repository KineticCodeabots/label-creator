<script>
	export let part;
	$: console.log("Part changed", part);
	export let removing = false;

	const id = Math.random().toString(36).substring(7);

	function handleImageUpload(event) {
		const file = event.target.files[0];
		if (file) {
			part.file = file;
			const reader = new FileReader();
			reader.onload = () => {
				part.image = reader.result;
				part = part;
			};
			reader.readAsDataURL(file);
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="part-label {removing ? 'removing' : ''}" on:click|capture>
	<div class="text-container">
		<p
			class="name"
			spellcheck="false"
			contenteditable
			bind:textContent={part.name}
		></p>
		<p
			class="part-number"
			spellcheck="false"
			contenteditable
			bind:textContent={part.partNumber}
		></p>
	</div>
	<label for={id} class="image-container"
		><img
			src={part.image.startsWith("data:")
				? part.image
				: "images/" + part.image}
			alt={part.name}
			on:load={(e) => {
				// @ts-ignore
				e.target.style.display = "block";
			}}
		/></label
	>

	<input
		type="file"
		{id}
		class="image-upload"
		accept="image/*"
		on:change={handleImageUpload}
	/>
</div>

<style>
	p {
		outline: none;
		min-width: 20px;
	}
	.part-label {
		width: 6.2cm;
		height: 1.7cm;
		border: black 2px solid;
		display: flex;
		justify-content: space-between;
		overflow: hidden;
	}
	.part-label.removing {
		background-color: #fdd;
		cursor: pointer;
	}

	.text-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-top: 5px;
		margin-left: 5px;
		margin-bottom: 3px;
	}

	.name {
		font-size: 1em;
		font-weight: bold;
		color: #333;
		margin: 0;
	}

	.part-number {
		font-size: 0.7em;
		color: #333;
		margin: 0;
	}

	.image-container {
		margin-top: 3px;
		margin-bottom: 3px;
		margin-right: 4px;
		cursor: pointer;
		aspect-ratio: 1/1;
	}

	.image-container img {
		height: 100%;
		object-fit: contain;
		display: none;
		aspect-ratio: 1/1;
	}

	.image-upload {
		display: none;
	}
</style>
