import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Multer: store uploads in OS temp dir
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, os.tmpdir()),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = [".p12", ".pfx", ".mobileprovision", ".ipa"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.fieldname === "ipa") {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${ext}`));
    }
  },
});

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ─── IPA Signing Endpoint ─────────────────────────────────────────────────
  app.post(
    "/api/sign",
    upload.fields([
      { name: "certificate", maxCount: 1 },
      { name: "provision", maxCount: 1 },
      { name: "ipa", maxCount: 1 },
    ]),
    async (req, res) => {
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ipa-sign-"));
      const uploaded: string[] = [];

      try {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        // Validate all 3 files are present
        if (!files.certificate?.[0] || !files.provision?.[0] || !files.ipa?.[0]) {
          res.status(400).json({ error: "Missing files. Need: certificate, provision, ipa" });
          return;
        }

        const certPath = files.certificate[0].path;
        const provPath = files.provision[0].path;
        const ipaPath = files.ipa[0].path;
        const { certPassword = "", bundleId, appName } = req.body;

        uploaded.push(certPath, provPath, ipaPath);

        const outputPath = path.join(tmpDir, "signed.ipa");

        // Build zsign command
        // zsign: https://github.com/zhlynn/zsign
        let cmd = `zsign -k "${certPath}" -m "${provPath}" -o "${outputPath}"`;
        if (certPassword) cmd += ` -p "${certPassword.replace(/"/g, '\\"')}"`;
        if (bundleId) cmd += ` -b "${bundleId}"`;
        if (appName) cmd += ` -n "${appName}"`;
        cmd += ` "${ipaPath}"`;

        try {
          await execAsync(cmd, { timeout: 5 * 60 * 1000 }); // 5 min timeout
        } catch (signErr: unknown) {
          const errMsg = signErr instanceof Error ? signErr.message : String(signErr);

          // Friendly error messages
          if (errMsg.includes("not found") || errMsg.includes("command not found")) {
            res.status(500).json({
              error:
                "zsign is not installed on this server. Please follow INSTRUCTIONS.md to install it.",
            });
          } else if (errMsg.includes("password") || errMsg.includes("passphrase")) {
            res.status(400).json({ error: "Wrong certificate password. Please try again." });
          } else if (errMsg.includes("provision")) {
            res.status(400).json({
              error: "Provisioning profile error. Make sure it matches your certificate.",
            });
          } else {
            res.status(500).json({ error: `Signing failed: ${errMsg}` });
          }
          return;
        }

        // Stream signed IPA back
        const originalName = files.ipa[0].originalname.replace(/\.ipa$/i, "");
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${originalName}-signed.ipa"`
        );
        res.sendFile(outputPath, async (err) => {
          if (err && !res.headersSent) {
            res.status(500).json({ error: "Failed to send signed file" });
          }
          // Cleanup
          await cleanupFiles(uploaded);
          await fs.rm(tmpDir, { recursive: true, force: true });
        });
      } catch (err: unknown) {
        await cleanupFiles(uploaded);
        await fs.rm(tmpDir, { recursive: true, force: true });
        const msg = err instanceof Error ? err.message : "Unknown error";
        if (!res.headersSent) {
          res.status(500).json({ error: msg });
        }
      }
    }
  );

  // Health check endpoint
  app.get("/api/health", async (_req, res) => {
    let zsignInstalled = false;
    try {
      await execAsync("zsign --version");
      zsignInstalled = true;
    } catch {
      try {
        await execAsync("which zsign");
        zsignInstalled = true;
      } catch {
        zsignInstalled = false;
      }
    }
    res.json({ ok: true, zsign: zsignInstalled });
  });

  // ─── Static files ──────────────────────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

async function cleanupFiles(paths: string[]) {
  await Promise.allSettled(paths.map((p) => fs.unlink(p).catch(() => {})));
}

startServer().catch(console.error);
