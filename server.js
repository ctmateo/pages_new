import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';


dotenv.config()

const app = express();
const PORT = process.env.PORT | 3000;

const file = fileURLToPath(import.meta.url);
const dir = path.dirname(file);

// Middleware
app.use(express.json());

app.use(express.static(dir)); 

app.post("/translate", async (req, res) => {
  const { text, lang } = req.body;

  try {
    const deeplRes = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": process.env.API_KEY,
      },
      body: new URLSearchParams({
        text,
        target_lang: lang,
      }),
    });

    const rawText = await deeplRes.text();
    console.log("DeepL raw response:", rawText);

    try {
      res.json(JSON.parse(rawText));
    } catch {
      res.status(500).json({ error: "Respuesta inválida de DeepL", raw: rawText });
    }
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor", details: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
