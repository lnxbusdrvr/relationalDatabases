# docker run --name psql -e POSTGRES_PASSWORD=postgresql -e PGDATA=/var/lib/postgresql/data/pgdata -v ./postgres:/var/lib/postgresql/data -p 5432:5432 postgres
# docker exec -it psql psql -U postgres
