postgres:
	docker run --name postgres-project1 -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:12-alpine

createdb:
	docker exec -it postgres-project1 createdb --username=root --owner=root project1

dropdb:
	docker exec -it postgres-project1 dropdb --username=root project1

server:
	uvicorn server:app --reload

install:
	pip3 install -r requirements.txt

deploy:
	docker compose up --build

.PHONY: postgres createdb dropdb server
