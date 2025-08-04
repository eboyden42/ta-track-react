import bcrypt

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt and return the hashed password as a string.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(check_pass: str, actual_pass: str) -> bool:
    """
    Check a password against a hashed password using bcrypt.
    """
    return bcrypt.checkpw(
        check_pass.encode('utf-8'), 
        actual_pass.encode('utf-8')
    )
