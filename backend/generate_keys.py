import secrets
from cryptography.fernet import Fernet

cookie_key = secrets.token_urlsafe(32)
encryption_key = Fernet.generate_key()

print(f"Generated cookies key: {cookie_key}")
print(f"Generated encryption key: {encryption_key.decode()}")