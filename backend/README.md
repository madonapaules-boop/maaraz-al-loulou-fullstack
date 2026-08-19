# Maaraz Al-Loulou API

This project is the **.NET 10 REST API and internal admin dashboard** for معرض اللؤلؤه. It uses a layered ASP.NET Core architecture with Controllers, Services, Repositories, DTOs, Entity Framework Core, SQL Server support, JWT-protected admin routes, Swagger, validated image uploads, and a seeded catalog.

## What is included

| Area           | Included functionality                                                                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public catalog | Products, filters, search, price sorting, categories, best sellers, new arrivals, and offers endpoints.                                                                 |
| Admin API      | JWT login, product and image CRUD, category CRUD, and manually logged WhatsApp order management.                                                                        |
| Internal UI    | A responsive admin dashboard at `/admin` with product stock editing, low-stock indicators, product flags, category management, order status updates, and image uploads. |
| Database       | SQL Server-ready EF Core Code-First schema and the generated initial migration under `Data/Migrations`.                                                                 |
| Seed content   | Twelve exact requested category names, twelve sample products, and one configurable administrator account.                                                              |

## Prerequisites

Install the .NET 10 SDK and make a SQL Server database available. The API uses the `ConnectionStrings__MaarazAlLoulou` environment variable in production. If this value is omitted, it starts with an **in-memory development database** so the API and dashboard can be tested without SQL Server; do not use that fallback for production.

## Local configuration

Set the following values in your local shell or in a secure deployment configuration. Do not commit a production connection string, JWT key, or administrator password.

```bash
export ConnectionStrings__MaarazAlLoulou='Server=YOUR_SQL_SERVER;Database=MaarazAlLoulou;User Id=YOUR_USER;Password=YOUR_PASSWORD;TrustServerCertificate=True;'
export Jwt__Key='USE_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARACTERS'
export SeedAdmin__Username='admin'
export SeedAdmin__Password='CHANGE_THIS_ADMIN_PASSWORD'
```

The allowed frontend origins are configured in `appsettings.json` under `Cors:AllowedOrigins`. Add the final public storefront domain there before deployment.

## Run locally

First, restore packages and apply the included initial migration to SQL Server.

```bash
dotnet restore
dotnet ef database update
dotnet run
```

In development, Swagger is available at `http://localhost:5000/swagger` or the port printed by ASP.NET Core. The internal dashboard is at `http://localhost:5000/admin`.

For a quick UI/API demonstration without SQL Server, omit `ConnectionStrings__MaarazAlLoulou` and run the same `dotnet run` command. Data will be seeded in memory for that process only.

## Default development administrator

The development seed values in `appsettings.json` are:

| Field    | Value                       |
| -------- | --------------------------- |
| Username | `admin`                     |
| Password | `ChangeMeBeforeProduction!` |

> Replace both the JWT key and administrator password before any production deployment.

## Connect the existing public storefront

The existing React storefront now uses the API as its only catalog source. At the point the frontend is built, supply the deployed API origin through the public build-time variable below, without a trailing slash:

```bash
VITE_API_BASE_URL=https://api.your-domain.example pnpm build
```

For local development with the API running on port `5080`, use:

```bash
VITE_API_BASE_URL=http://localhost:5080 pnpm dev
```

The catalog, product details, favorites, cart totals, category filter, homepage best-seller/new-arrival/offer sections, and discounted product cards all consume the public API responses.

## Main routes

| Scope            | Route                                                                                                                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public catalog   | `GET /api/products`, `GET /api/products/{id}`, `GET /api/products/best-sellers`, `GET /api/products/new-arrivals`, `GET /api/products/offers`, `GET /api/categories` |
| Admin auth       | `POST /api/auth/login`                                                                                                                                               |
| Admin products   | `POST`, `PUT`, `DELETE /api/products`; `POST /api/products/{id}/images`; `DELETE /api/products/images/{imageId}`                                                     |
| Admin categories | `POST`, `PUT`, `DELETE /api/categories`                                                                                                                              |
| Admin orders     | `GET`, `POST /api/orders`; `PUT`, `DELETE /api/orders/{id}`                                                                                                          |

All admin routes require a Bearer token with the `Admin` role. Image uploads only accept JPG, PNG, and WebP files up to 5 MB per image.
