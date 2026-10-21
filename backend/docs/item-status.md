# Item status

Every item has a `status`: `todo` (the default), `in_progress` or `done`.

## API

| Endpoint | What changed |
|---|---|
| `GET /api/v1/items/` | Optional `status` query parameter to list only the items with that status. The response returns `total` (it was `count`). |
| `POST /api/v1/items/`, `PUT /api/v1/items/{id}` | Accept an optional `status`. |
| `GET /api/v1/items/stats` | New: the number of items per status, for the current user (every item for a superuser). |

## Migration

`3c9e1f2b7a41_add_status_to_item` adds the `itemstatus` enum and the `item.status` column, with `todo` for the
existing rows. Run `alembic upgrade head` before starting the new version.

## Clients

`count` → `total` in `GET /api/v1/items/` is a breaking change: regenerate the frontend client
(`bun run generate-client`) and update any other client that reads `count`.
