import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { router as promptsRouter } from "./routes/prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "50mb" })); // canvas images can be large

// Serve saved drawings statically
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", promptsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
