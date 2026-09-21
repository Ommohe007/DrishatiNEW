"""
db.py — Async MongoDB client wrapper for Project Drishti.
Falls back to an in-memory MockDB if MongoDB is unreachable.

SIH 2026 PS-26060 | Ministry of Earth Sciences
"""

import logging
import os
from collections import defaultdict

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("drishti.db")

# ──────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────
MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME: str = "drishti_db"
_MAX_MOCK_DOCS: int = 10_000  # per collection in MockDB

# ──────────────────────────────────────────────────────────────
# In-memory fallback store
# ──────────────────────────────────────────────────────────────


class MockDB:
    """
    Thread-safe-enough in-memory document store that mimics the subset
    of Motor / PyMongo API used by this project.

    Storage: { collection_name: [doc, doc, ...] }
    Each collection is capped at _MAX_MOCK_DOCS documents (oldest are
    evicted once the cap is hit).
    """

    def __init__(self) -> None:
        self._store: dict[str, list[dict]] = defaultdict(list)

    # ------------------------------------------------------------------
    # Public helpers matching the module-level API below
    # ------------------------------------------------------------------

    async def insert_one(self, collection: str, doc: dict) -> None:
        """Append *doc* to *collection*, evicting the oldest entry when full."""
        col = self._store[collection]
        if len(col) >= _MAX_MOCK_DOCS:
            # Evict the oldest 10 % to avoid per-insert O(n) shifts
            evict = _MAX_MOCK_DOCS // 10
            del col[:evict]
        col.append(doc)

    async def find_recent(
        self,
        collection: str,
        n: int = 100,
        filter: dict | None = None,
    ) -> list[dict]:
        """Return the last *n* documents from *collection*, newest-last."""
        col = self._store[collection]
        if filter:
            col = [
                d for d in col
                if all(d.get(k) == v for k, v in filter.items())
            ]
        return col[-n:]


# ──────────────────────────────────────────────────────────────
# Singleton — set once during startup
# ──────────────────────────────────────────────────────────────
_db_instance: "MotorDB | MockDB | None" = None


class MotorDB:
    """Thin wrapper around a Motor AsyncIOMotorDatabase."""

    def __init__(self, database) -> None:  # database: AsyncIOMotorDatabase
        self._db = database

    async def insert_one(self, collection: str, doc: dict) -> None:
        await self._db[collection].insert_one(doc)

    async def find_recent(
        self,
        collection: str,
        n: int = 100,
        filter: dict | None = None,
    ) -> list[dict]:
        cursor = (
            self._db[collection]
            .find(filter or {}, {"_id": 0})
            .sort("_id", -1)
            .limit(n)
        )
        docs = await cursor.to_list(length=n)
        return list(reversed(docs))  # return oldest-first


# ──────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────


async def get_db() -> "MotorDB | MockDB":
    """
    Return the shared DB instance.

    On first call this function attempts to connect to MongoDB.  If the
    connection ping fails within 2 seconds it falls back silently to
    MockDB.
    """
    global _db_instance
    if _db_instance is not None:
        return _db_instance

    try:
        import motor.motor_asyncio as motor  # type: ignore

        client = motor.AsyncIOMotorClient(
            MONGO_URI,
            serverSelectionTimeoutMS=2_000,
        )
        # Verify the connection is actually alive
        await client.admin.command("ping")
        _db_instance = MotorDB(client[DB_NAME])
        logger.info("Connected to MongoDB at %s (db=%s)", MONGO_URI, DB_NAME)
    except Exception as exc:
        logger.warning(
            "MongoDB unreachable (%s). Falling back to in-memory MockDB.", exc
        )
        _db_instance = MockDB()

    return _db_instance


async def insert_one(collection: str, doc: dict) -> None:
    """Insert *doc* into *collection* via the active DB backend."""
    db = await get_db()
    await db.insert_one(collection, doc)


async def find_recent(
    collection: str,
    n: int = 100,
    filter: dict | None = None,
) -> list[dict]:
    """Return the last *n* documents from *collection*."""
    db = await get_db()
    return await db.find_recent(collection, n=n, filter=filter)
