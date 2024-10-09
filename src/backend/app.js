import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./router.js";
import { getLists } from "./lists.js";

const { PORT = 3000 } = process.env;

// Create an Express app
const app = express();

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the view engine
app.set("view engine", "ejs");

// Specify the location of your views (EJS files)
app.set("views", path.join(__dirname, "../frontend/views"));

// Route to render an EJS template
app.get("/", async (req, res) => {
	res.render("index", {
		lists: await getLists(),
	});
});

app.use(express.static(path.join(__dirname, "../frontend/public")));

app.use("/api", apiRouter);

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
