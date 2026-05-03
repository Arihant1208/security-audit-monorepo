from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "steve-ai-engine",
        "version": "2.0.0",
    }
