from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from routers.datasets import router as datasets_router
from services.app_error import AppError

app = FastAPI(
    title="Duckling Studio Machine Learning Tasks API",
)


@app.exception_handler(AppError)
async def custom_http_exception_handler(_: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_json(),
    )


@app.get("/health", tags=['healthcheck'])
async def health():
    return {"status": "ok"}


app.include_router(datasets_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
