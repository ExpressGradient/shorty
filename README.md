# Shorty
Shorty is a simple REST API for creating and accessing shortLinks of URLs.

API Link: https://shorty.onrender.com/

Routes:
- GET /health - for health check
- POST /auth/login - for login
- POST /auth/register - for register
- GET /shortcuts - for getting all shortcuts
- POST /shortcuts - for creating a new shortcut
- DELETE /shortcuts/:id - for deleting a shortcut
- GET /goto/:shortLink - for accessing a shortcut

## Built with
* [Fastify](https://fastify.io) and its plugins for the API
* [Prisma](https://prisma.io) as the ORM for Postgres
* [TypeScript](https://typescriptlang.org) for its type sugar over JS

## Benchmarks
A few benchmark tests were performed on the API using [AutoCannon](https://github.com/mcollina/autocannon). They are stored in src/benchmarks.

## Why Fastify?
Fastify gives you blazing fast Node.js APIs. It also has a rich plugin ecosystem for extending the API. It has schema validation and serialization built in.

## Why Prisma?
Prisma generates a powerful TypeScript ORM with a simple API from its schema. It also comes with a CLI for migrations and also a studio for visually interacting with the models.

## What's the Authentication Mechanism?
The API has a simple Email/Password Authentication with the Password hashed by Bcrypt. The API then generates a JWT which is verified everytime a request is made to the core API services like creating a shortcut or accessing it.

This is mainly chosen because of its simplicity and stateless nature.

## What's the Database?
The database is a Postgres database. 

It is mainly chosen because it
* The data is mostly relational
* It integrates well with Prisma
* Has huge number of extensions (pg_trgm and btree_gin for full text search used for the API)

## How does the Database scale?
The following are a few techniques to scale the database with increase in users:
* Vertical Scaling by adding more RAM and CPU.
* Sharding on the Shortcuts table with (user_id and shortLink) as the sharding key.
* Command Query Responsibility Segregation (only useful if read inconsistency is allowed). Replicating the database to separate servers for Read and Write.
* Global Distribution. Including a location column in the Users table and including it while.

## What are the internal fields?
Every table includes a createdAt field defaulting to the current time while inserting the record.

While accessing the shortcut, the action is recorded. This is useful for analytics. For example, how many times a user has been accessing a shortcut, so that the shortcut can be pushed into recommendations.

## Infrastructure
A Render Web Service hosted in Singapore and a Render Postgres DB hosted in the same cluster.
