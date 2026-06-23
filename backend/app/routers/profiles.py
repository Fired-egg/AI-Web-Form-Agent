"""Profile management API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Profile
from app.schemas import ProfileCreate, ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])


def get_profile_or_404(profile_id: int, db: Session) -> Profile:
    """Return a profile or raise a consistent not-found response."""

    profile = db.get(Profile, profile_id)
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    return profile


@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(profile_data: ProfileCreate, db: Session = Depends(get_db)) -> Profile:
    """Create and persist a profile."""

    profile = Profile(**profile_data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("", response_model=list[ProfileResponse])
def list_profiles(db: Session = Depends(get_db)) -> list[Profile]:
    """Return all profiles ordered by id."""

    return list(db.scalars(select(Profile).order_by(Profile.id)))


@router.get("/{profile_id}", response_model=ProfileResponse)
def get_profile(profile_id: int, db: Session = Depends(get_db)) -> Profile:
    """Return one profile by id."""

    return get_profile_or_404(profile_id, db)


@router.put("/{profile_id}", response_model=ProfileResponse)
def update_profile(
    profile_id: int,
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
) -> Profile:
    """Update fields supplied for an existing profile."""

    profile = get_profile_or_404(profile_id, db)
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(profile_id: int, db: Session = Depends(get_db)) -> Response:
    """Delete a profile."""

    profile = get_profile_or_404(profile_id, db)
    db.delete(profile)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
