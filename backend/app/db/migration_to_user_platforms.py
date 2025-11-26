"""
Migration script to transition from steam_id in users table to UserPlatform table.

This script:
1. Reads all existing users with steam_id
2. Creates UserPlatform entries for Steam
3. Keeps steam_id for backwards compatibility (will be nullable)
"""

from sqlalchemy.orm import Session
from datetime import datetime
from ..models import User, UserPlatform
from ..database import SessionLocal
import logging

logger = logging.getLogger(__name__)


def migrate_steam_users_to_platforms(db: Session = None):
    """
    Migrate existing Steam users to UserPlatform model.
    
    This should be called once after the UserPlatform table is created.
    It's safe to call multiple times - it checks for existing entries.
    """
    if db is None:
        db = SessionLocal()
    
    try:
        # Find all users with steam_id that don't have a UserPlatform entry yet
        users_with_steam_id = db.query(User).filter(User.steam_id.isnot(None)).all()
        
        migrated_count = 0
        skipped_count = 0
        
        for user in users_with_steam_id:
            # Check if already migrated
            existing_platform = db.query(UserPlatform).filter(
                UserPlatform.user_id == user.id,
                UserPlatform.platform == 'steam'
            ).first()
            
            if existing_platform:
                logger.info(f"User {user.id} ({user.username}) already has Steam platform")
                skipped_count += 1
                continue
            
            # Create UserPlatform entry
            platform = UserPlatform(
                user_id=user.id,
                platform='steam',
                platform_id=user.steam_id,
                username=user.username,
                avatar_url=user.avatar_url,
                profile_url=user.profile_url,
                is_active=True,
                last_synced=datetime.utcnow()
            )
            
            db.add(platform)
            migrated_count += 1
            logger.info(f"Migrated user {user.id} ({user.username}) to Steam platform")
        
        db.commit()
        logger.info(f"Migration complete: {migrated_count} migrated, {skipped_count} skipped")
        return {"migrated": migrated_count, "skipped": skipped_count}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    """Run migration when executed directly"""
    result = migrate_steam_users_to_platforms()
    print(f"Migration result: {result}")
