.PHONY: up down build logs test clean seed shell-backend shell-frontend

## Start all services (dev mode with hot-reload)
up:
	docker-compose up --build

## Start in detached mode
up-detached:
	docker-compose up --build -d

## Stop all services
down:
	docker-compose down

## Rebuild images without cache
build:
	docker-compose build --no-cache

## Follow logs
logs:
	docker-compose logs -f

## Run backend tests
test:
	docker-compose run --rm backend pytest tests/ -v

## Run tests locally (requires venv)
test-local:
	cd backend && python -m pytest tests/ -v

## Clean up containers, volumes, data
clean:
	docker-compose down -v
	rm -f backend/app/data/*.csv

## Re-seed demo data (delete CSVs and restart)
seed:
	rm -f backend/app/data/*.csv
	docker-compose restart backend

## Open a shell in the backend container
shell-backend:
	docker-compose exec backend bash

## Open a shell in the frontend container
shell-frontend:
	docker-compose exec frontend sh

## Show API docs URL
docs:
	@echo "API docs: http://localhost:8000/docs"
	@echo "App:      http://localhost"
