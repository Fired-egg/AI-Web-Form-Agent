"""Task-related API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ActionLog, Screenshot, Task
from app.schemas import ActionLogResponse, ScreenshotResponse
from app.services.browser_executor import open_url_and_capture_screenshot

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_task_or_404(task_id: int, db: Session) -> Task:
    """Return a task or raise a consistent not-found response."""

    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.get("/{task_id}/logs", response_model=list[ActionLogResponse])
def list_task_logs(task_id: int, db: Session = Depends(get_db)) -> list[ActionLog]:
    """Return a task's logs in execution order."""

    get_task_or_404(task_id, db)

    statement = (
        select(ActionLog)
        .where(ActionLog.task_id == task_id)
        .order_by(ActionLog.step, ActionLog.created_at, ActionLog.id)
    )
    return list(db.scalars(statement))


@router.post(
    "/{task_id}/screenshots",
    response_model=ScreenshotResponse,
    status_code=status.HTTP_201_CREATED,
)
async def capture_task_screenshot(
    task_id: int,
    db: Session = Depends(get_db),
) -> Screenshot:
    """Open the task URL and capture a screenshot for browser testing."""

    task = get_task_or_404(task_id, db)
    screenshot = await open_url_and_capture_screenshot(
        task_id=task.id,
        url=task.url,
        stage="page_opened",
        db=db,
    )
    db.commit()
    db.refresh(screenshot)
    return screenshot


@router.get(
    "/{task_id}/screenshots",
    response_model=list[ScreenshotResponse],
)
def list_task_screenshots(
    task_id: int,
    db: Session = Depends(get_db),
) -> list[Screenshot]:
    """Return all screenshots captured for a task."""

    get_task_or_404(task_id, db)
    statement = (
        select(Screenshot)
        .where(Screenshot.task_id == task_id)
        .order_by(Screenshot.created_at, Screenshot.id)
    )
    return list(db.scalars(statement))
