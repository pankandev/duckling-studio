
generate_models:
	sqlacodegen --generator declarative postgresql://postgres:postgres@localhost:5432/postgres > generated/sql_models.py

dbautogeneratemigrations:
	alembic revision --autogenerate

dbmigrate:
	alembic upgrade head

dev:
	fastapi run --reload

run_api:
	alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000

run_celery:
	alembic upgrade head && celery -A celery_tasks.celery_app worker
