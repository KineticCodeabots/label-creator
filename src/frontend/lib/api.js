export function fetchLists() {
	return fetch("/api/lists").then((res) => res.json());
}

export function fetchList(listName) {
	return fetch("/api/lists/" + listName).then((res) => res.json());
}

export function uploadImage(file) {
	const formData = new FormData();
	formData.append("file", file);
	return fetch("/api/images", {
		method: "POST",
		body: formData,
	})
		.then((res) => {
			if (!res.ok) {
				throw res;
			}
			return res.json();
		})
		.then((data) => data.filename);
}

export function updateList(listName, list) {
	return fetch("/api/lists/" + listName, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(list),
	});
}
