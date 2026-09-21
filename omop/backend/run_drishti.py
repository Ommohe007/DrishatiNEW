"""Run Project Drishti backend — Uvicorn ASGI (SIH 2026 PS-26060)"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "drishti.main:sio_app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )
