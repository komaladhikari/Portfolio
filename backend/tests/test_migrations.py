from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect


def test_migrations_create_wishes_table(tmp_path: Path) -> None:
    database_path = tmp_path / "migrations.db"
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", f"sqlite:///{database_path}")

    command.upgrade(config, "head")

    engine = create_engine(f"sqlite:///{database_path}")
    inspector = inspect(engine)
    assert "wishes" in inspector.get_table_names()
    assert {column["name"] for column in inspector.get_columns("wishes")} == {
        "id",
        "text",
        "status",
        "visibility",
        "created_at",
        "granted_at",
        "sky_x",
        "sky_y",
        "claim_token_hash",
    }
    text_column = next(
        column for column in inspector.get_columns("wishes") if column["name"] == "text"
    )
    assert text_column["type"].length == 200
    engine.dispose()
