import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "HomeStock"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "homestock-secret-super-key-2026-academic-dbms-jwt-token"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # MySQL Database Settings
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "root")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DB: str = os.getenv("MYSQL_DB", "homestock")

    # Storage & OCR settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")

    @property
    def mysql_database_url(self) -> str:
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}?charset=utf8mb4"

    @property
    def sqlite_database_url(self) -> str:
        data_dir = os.getenv("DATA_DIR", ".")
        try:
            os.makedirs(data_dir, exist_ok=True)
        except Exception:
            data_dir = "."
        db_path = os.path.join(data_dir, "homestock.db")
        return f"sqlite:///{db_path}"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
