FROM python:3.12-slim

RUN adduser --disabled-password --gecos '' celeryuser

WORKDIR /app
RUN chown -R celeryuser:celeryuser /app

RUN apt -y update; apt -y install curl make

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
