# Shariqa Tikka Bites

Modern fast-food website with separate pages, animated UI, contact popup, quick order builder, WhatsApp order link, gallery, chatbot, and a small backend API.

## Frontend

Open `index.html` directly or host the folder with GitHub Pages.

## Backend

Run:

```bash
python server.py
```

Then open:

```text
http://localhost:8000
```

Contact form submissions go to `data/submissions.jsonl`. If SMTP environment variables are set, the backend also emails the inquiry to `sharixa393@gmail.com`.

## Backend API

- `GET /api/health`
- `GET /api/menu`
- `POST /api/contact`
