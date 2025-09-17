import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// --- Разрешаваме само твоя фронтенд (Firebase app) да прави заявки ---
const allowedOrigin = "https://recipesbook-dd53e.web.app";
app.use(cors({
    origin: allowedOrigin
}));

// --- Middleware за парсване на JSON заявки ---
app.use(express.json());

// --- Настройка на multer за памет ---
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- Ендпойнт за качване на изображение към Catbox ---
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Не е избран файл!' });
    }

    try {
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('fileToUpload', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Catbox upload failed with status ${response.status}`);
        }

        const imageUrl = await response.text();
        console.log(`Image uploaded: ${imageUrl}`);
        res.json({ url: imageUrl });

    } catch (err) {
        console.error('Upload error:', err.message);
        res.status(500).json({ error: 'Качването на изображението неуспя!' });
    }
});

// --- Анти-кеширане за всички .js файлове ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use((req, res, next) => {
    if (req.url.endsWith(".js")) {
        res.setHeader("Cache-Control", "no-store");
    }
    next();
});

// --- Сервиране на статични файлове (ако имаш такива) ---
app.use(express.static(path.join(__dirname, "public")));

// --- Базов тестов рут ---
app.get('/', (req, res) => res.send('Server is running!'));

// --- Стартиране на сървъра ---
app.listen(port, () => console.log(`Server running on port ${port}`));
