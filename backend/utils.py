import bcrypt

def hash_password(password: str) -> str:
    """
    Hashes a password using pure bcrypt.
    1. Converts the password to bytes.
    2. Generates a salt and hashes it.
    3. Decodes the result back to a string for the database.
    """
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a password.
    1. Converts both the plain password and the stored hash to bytes.
    2. Uses bcrypt.checkpw to safely compare them.
    """
    try:
        plain_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception as e:
        print(f"Hashing Error: {e}")
        return False