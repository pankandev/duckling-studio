
generate_models:
	sqlacodegen --generator declarative postgresql://postgres:postgres@localhost:5432/postgres > generated/sql_models.py

dbautogeneratemigrations:
	alembic revision --autogenerate

dbmigrate:
	alembic upgrade head

dev:
	pip install fastapi[standard]
	fastapi run --reload