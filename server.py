from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from email.message import EmailMessage
from pathlib import Path
from urllib.parse import parse_qs
import json
import os
import smtplib
import time


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
SUBMISSIONS_FILE = DATA_DIR / "submissions.jsonl"
CONTACT_EMAIL = "sharixa393@gmail.com"


MENU_ITEMS = [
    {"name": "Loaded Pizza", "price": 199, "category": "Pizza"},
    {"name": "Classic Cheese Burger", "price": 129, "category": "Burger"},
    {"name": "Chicken Tikka", "price": 179, "category": "Tikka"},
    {"name": "Tikka Wrap / Roll", "price": 149, "category": "Wrap"},
    {"name": "Masala Fries", "price": 89, "category": "Snacks"},
    {"name": "Cheesy Pasta", "price": 159, "category": "Pasta"},
]


def json_response(handler, status, payload):
    data = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def read_request_data(handler):
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length).decode("utf-8") if length else ""
    content_type = handler.headers.get("Content-Type", "")
    if "application/json" in content_type:
        return json.loads(raw or "{}")
    parsed = parse_qs(raw)
    return {key: values[0] if values else "" for key, values in parsed.items()}


def validate_contact(payload):
    required = ["name", "phone", "order_item", "customer_address", "message"]
    missing = [field for field in required if not str(payload.get(field, "")).strip()]
    if missing:
        return f"Missing fields: {', '.join(missing)}"
    phone = "".join(ch for ch in str(payload.get("phone", "")) if ch.isdigit())
    if len(phone) < 10:
        return "Please enter a valid phone number."
    return ""


def save_submission(payload):
    DATA_DIR.mkdir(exist_ok=True)
    record = {
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "name": payload.get("name", ""),
        "phone": payload.get("phone", ""),
        "order_item": payload.get("order_item", ""),
        "quantity": payload.get("quantity", ""),
        "needed_by": payload.get("needed_by", ""),
        "customer_address": payload.get("customer_address", ""),
        "message": payload.get("message", ""),
    }
    with SUBMISSIONS_FILE.open("a", encoding="utf-8") as file:
        file.write(json.dumps(record, ensure_ascii=False) + "\n")
    return record


def send_email(record):
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    from_email = os.environ.get("FROM_EMAIL", smtp_user or CONTACT_EMAIL)

    if not all([smtp_host, smtp_user, smtp_password, from_email]):
        return False

    message = EmailMessage()
    message["Subject"] = "New inquiry from Shariqa Tikka Bites website"
    message["From"] = from_email
    message["To"] = CONTACT_EMAIL
    message.set_content(
        "\n".join(
            [
                f"Name: {record['name']}",
                f"Phone: {record['phone']}",
                f"Food item: {record['order_item']}",
                f"Quantity: {record['quantity']}",
                f"Needed by: {record['needed_by']}",
                f"Address: {record['customer_address']}",
                f"Message: {record['message']}",
                f"Created at: {record['created_at']}",
            ]
        )
    )

    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.starttls()
        smtp.login(smtp_user, smtp_password)
        smtp.send_message(message)
    return True


class ShariqaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == "/api/health":
            json_response(self, 200, {"ok": True, "service": "Shariqa Tikka Bites backend"})
            return
        if self.path == "/api/menu":
            json_response(self, 200, {"ok": True, "items": MENU_ITEMS})
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/api/contact":
            json_response(self, 404, {"ok": False, "message": "Not found"})
            return

        try:
            payload = read_request_data(self)
            error = validate_contact(payload)
            if error:
                json_response(self, 400, {"ok": False, "message": error})
                return
            record = save_submission(payload)
            email_sent = send_email(record)
            json_response(
                self,
                200,
                {
                    "ok": True,
                    "message": "Inquiry received successfully.",
                    "emailSent": email_sent,
                },
            )
        except Exception as exc:
            json_response(self, 500, {"ok": False, "message": str(exc)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), ShariqaHandler)
    print(f"Shariqa Tikka Bites running at http://localhost:{port}")
    server.serve_forever()
