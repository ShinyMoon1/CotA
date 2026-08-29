include .env
export

export PROJECT_ROOT=$(shell pwd)

env-up:
	@docker compose up -d cota-postgres

env-down:
	@docker compose down cota-postgres

env-cleanup:
	@read -p "Очистить файлы папки бд? [y/N]" ans; \
	if [ "$$ans" = "y" ]; then \
		docker compose down cota-postgres && \
		rm -rf out/pgdata && \
		echo "Файлы очищены!"; \
	else \
		echo "Очистка окружения отменена"; \
	fi

env-port-forward:
	@docker compose up -d port-forwarder

env-port-close:
	@docker compose down port-forwarder

migrate-create:
	@if [ -z "$(seq)" ]; then \
		echo "Отсутсвует необходимый параметр seq"; \
		exit 1; \
	fi; \
	docker compose run --rm cota-postgres-migrate \
		create \
		-ext sql \
		-dir /migrations \
		-seq "$(seq)"

migrate-action:
	@if [ -z "$(action)" ]; then \
		echo "Отсутсвует необходимый параметр action"; \
		exit 1; \
	fi;\
	docker compose run --rm cota-postgres-migrate \
		-path /migrations \
		-database "postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@cota-postgres:5432/${POSTGRES_DB}?sslmode=disable" \
		$(action)

migrate-up:
	@make migrate-action action=up
	

migrate-down:
	@make migrate-action action=down

cota-run:
	@go run cmd/todoapp/main.go