from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GOOGLE_API_KEY: str

    FIREBASE_TYPE: str
    FIREBASE_PROJECT_ID: str
    FIREBASE_PRIVATE_KEY_ID: str
    FIREBASE_PRIVATE_KEY: str
    FIREBASE_CLIENT_EMAIL: str
    FIREBASE_CLIENT_ID: str
    FIREBASE_AUTH_URI: str
    FIREBASE_TOKEN_URI: str
    FIREBASE_AUTH_PROVIDER_CERT_URL: str
    FIREBASE_CLIENT_CERT_URL: str
    FIREBASE_UNIVERSE_DOMAIN: str

    CHROMA_PERSIST_DIR: str = "./chroma_db"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000" , "http://localhost:5173" ]
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    class Config:
        env_file = ".env"

settings = Settings()
