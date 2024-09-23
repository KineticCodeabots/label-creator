import * as fs from "fs/promises";
import * as ejs from "ejs";

const contentsList = JSON.parse(
	await fs.readFile("contentsList.json", "utf-8")
);

const labels = await ejs.renderFile("label.ejs", { contentsList });

await fs.writeFile("labels.html", labels);
