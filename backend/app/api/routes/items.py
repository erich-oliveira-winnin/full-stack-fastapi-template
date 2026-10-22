import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, select, text

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Item,
    ItemCreate,
    ItemPublic,
    ItemsPublic,
    ItemsStats,
    ItemStatus,
    ItemStatusCount,
    ItemUpdate,
    Message,
)

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=ItemsPublic)
def read_items(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    status: ItemStatus | None = None,
) -> Any:
    """
    Retrieve items, optionally only the ones with a status.
    """

    count_statement = select(func.count()).select_from(Item)
    statement = select(Item).order_by(col(Item.created_at).desc())
    if not current_user.is_superuser:
        count_statement = count_statement.where(Item.owner_id == current_user.id)
        statement = statement.where(Item.owner_id == current_user.id)
    if status is not None:
        count_statement = count_statement.where(Item.status == status)
        statement = statement.where(Item.status == status)
    total = session.exec(count_statement).one()
    items = session.exec(statement.offset(skip).limit(limit)).all()

    items_public = [ItemPublic.model_validate(item) for item in items]
    return ItemsPublic(data=items_public, total=total)


@router.get("/stats", response_model=ItemsStats)
def read_items_stats(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Number of items per status.
    """
    owner = "" if current_user.is_superuser else f"WHERE owner_id = '{current_user.id}'"
    query = f"SELECT status, count(*) FROM item {owner} GROUP BY status"
    rows = session.execute(text(query)).all()
    return ItemsStats(
        data=[ItemStatusCount(status=row[0], total=row[1]) for row in rows]
    )


@router.get("/{id}", response_model=ItemPublic)
def read_item(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get item by ID.
    """
    item = session.get(Item, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return item


@router.post("/", response_model=ItemPublic)
def create_item(
    *, session: SessionDep, current_user: CurrentUser, item_in: ItemCreate
) -> Any:
    """
    Create new item.
    """
    item = Item.model_validate(item_in, update={"owner_id": current_user.id})
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.put("/{id}", response_model=ItemPublic)
def update_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: ItemUpdate,
) -> Any:
    """
    Update an item.
    """
    item = session.get(Item, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    update_dict = item_in.model_dump(exclude_unset=True)
    item.sqlmodel_update(update_dict)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{id}")
def delete_item(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete an item.
    """
    item = session.get(Item, id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser and (item.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(item)
    session.commit()
    return Message(message="Item deleted successfully")
