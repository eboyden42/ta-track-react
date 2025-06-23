import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

fernet = Fernet(os.environ.get("ENCRYPT_KEY"))

def encrypt_data(plaintext: str) -> str:
    """
    Encrypt a string and return a base64-encoded ciphertext.
    """
    return fernet.encrypt(plaintext.encode()).decode()

def decrypt_data(ciphertext: str) -> str:
    """
    Decrypt a base64-encoded ciphertext and return the original string.
    """
    return fernet.decrypt(ciphertext.encode()).decode()


