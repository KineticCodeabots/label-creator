import express from "express";
import { getList, getLists, updateList } from "./lists.js";
import multer from "multer";
import mime from "mime-types";
import sharp from "sharp";
import path from "path";
import fs from "fs";

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

// create api endpoint "/autocrop" that serves images folder but applies a filter on it
router.get("/autocrop/:filename", async (req, res) => {
	const filename = req.params.filename;
	const imagePath = path.join("images", filename);

	// Check if the image exists
	if (!fs.existsSync(imagePath)) {
		return res.status(404).send("Image not found");
	}

	try {
		// Read the image, trim it using sharp, and send the modified image as a response
		const image = sharp(imagePath);
		const metadata = await image.metadata();
		const trimmedImage = await sharp(
			await image
				.extract({
					left: 1,
					top: 1,
					width: metadata.width - 2,
					height: metadata.height - 2,
				})
				.toBuffer()
		)
			.trim({
				// background: sampledColor,
				threshold: 15,
			})
			.toBuffer();

		// Set the correct headers and send the image as the response
		res.set("Content-Type", mime.lookup(imagePath));
		res.send(trimmedImage);
	} catch (err) {
		console.error(err);
		res.status(500).send({
			error: "Internal server error",
		});
	}
});

export default router;
