import express from "express";
import { getList, getLists, updateList } from "./lists.js";
import multer from "multer";

const router = express.Router();
router.get("/lists", async (req, res) => {
	res.json(await getLists());
});

router.get("/lists/:listName", async (req, res) => {
	const listName = req.params.listName;
	try {
		const list = await getList(listName);
		res.json(list);
	} catch (error) {
		if (error.code === "ENOENT") {
			res.status(404).json({ error: "List not found" });
		} else {
			res.status(500).json({ error: "Internal server error" });
		}
	}
});

router.put("/lists/:listName", express.json(), async (req, res) => {
	const listName = req.params.listName;
	const list = req.body;
	try {
		await updateList(listName, list);
		res.status(204).end();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "images/"); // The folder where files will be stored
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname); // Keep the original file name
	},
});
// Initialize multer with storage configuration (no file filter)
const upload = multer({ storage });

// Define a POST route for file uploads
// @ts-ignore
router.post("/images", upload.single("file"), (req, res) => {
	if (!req.file) {
		return res.status(400).end();
	}

	// File uploaded successfully
	res.status(200).send({
		filename: req.file.filename,
	});
});

router.use("/images", express.static("images"));

export default router;
