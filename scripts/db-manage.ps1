# TravelMate Database Management Script

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("init", "migrate", "reset", "seed", "backup", "restore")]
    [string]$Action,
    
    [string]$BackupFile = "",
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host "🗄️ TravelMate Database Management" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Load environment variables
if (Test-Path "backend\.env") {
    Get-Content "backend\.env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], [EnvironmentVariableTarget]::Process)
        }
    }
    Write-Host "✅ Loaded environment variables" -ForegroundColor Green
}

$DB_URL = $env:DATABASE_URL
if (-not $DB_URL) {
    $DB_URL = "postgresql://postgres:password@localhost:5432/travel_db"
    Write-Host "⚠️ Using default database URL" -ForegroundColor Yellow
}

# Navigate to backend directory
Set-Location "backend"

# Activate virtual environment if exists
if (Test-Path "..\env\Scripts\Activate.ps1") {
    & "..\env\Scripts\Activate.ps1"
    Write-Host "✅ Activated virtual environment" -ForegroundColor Green
}

switch ($Action) {
    "init" {
        Write-Host "🏗️ Initializing database..." -ForegroundColor Yellow
        
        # Check if alembic is initialized
        if (-not (Test-Path "alembic")) {
            Write-Host "Creating Alembic configuration..." -ForegroundColor Blue
            alembic init alembic
            
            # Update alembic.ini
            $alembicIni = Get-Content "alembic.ini" -Raw
            $alembicIni = $alembicIni -replace "sqlalchemy.url = .*", "sqlalchemy.url = $DB_URL"
            $alembicIni | Set-Content "alembic.ini"
            
            Write-Host "✅ Alembic initialized" -ForegroundColor Green
        }
        
        # Create initial migration
        Write-Host "Creating initial migration..." -ForegroundColor Blue
        alembic revision --autogenerate -m "Initial migration"
        
        # Run migration
        Write-Host "Running initial migration..." -ForegroundColor Blue
        alembic upgrade head
        
        Write-Host "✅ Database initialized successfully!" -ForegroundColor Green
    }
    
    "migrate" {
        Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
        
        # Generate new migration if models changed
        $response = Read-Host "Generate new migration? (y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            $migrationName = Read-Host "Enter migration name"
            alembic revision --autogenerate -m $migrationName
        }
        
        # Run migrations
        alembic upgrade head
        Write-Host "✅ Migrations completed!" -ForegroundColor Green
    }
    
    "reset" {
        if (-not $Force) {
            $confirmation = Read-Host "⚠️ This will delete all data! Are you sure? (type 'YES' to confirm)"
            if ($confirmation -ne "YES") {
                Write-Host "Operation cancelled" -ForegroundColor Yellow
                return
            }
        }
        
        Write-Host "🗑️ Resetting database..." -ForegroundColor Red
        
        # Drop all tables
        alembic downgrade base
        
        # Re-run migrations
        alembic upgrade head
        
        Write-Host "✅ Database reset completed!" -ForegroundColor Green
    }
    
    "seed" {
        Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
        
        # Create seed data script
        $seedScript = @"
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import sessionmaker
from config.database import engine
from models.models import User, Conversation, Booking
from auth.auth import get_password_hash
import json
from datetime import datetime

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Create admin user
    admin_user = User(
        email="admin@travelmate.com",
        name="Admin User",
        hashed_password=get_password_hash("admin123"),
        is_admin=True,
        is_pro=True
    )
    
    # Create sample users
    users = [
        User(
            email="user1@example.com",
            name="Nguyen Van A",
            hashed_password=get_password_hash("password123"),
            is_admin=False,
            is_pro=False
        ),
        User(
            email="user2@example.com", 
            name="Tran Thi B",
            hashed_password=get_password_hash("password123"),
            is_admin=False,
            is_pro=True
        )
    ]
    
    # Add to database
    db.add(admin_user)
    for user in users:
        db.add(user)
    
    db.commit()
    
    print("✅ Sample data seeded successfully!")
    
except Exception as e:
    print(f"❌ Error seeding data: {e}")
    db.rollback()
    
finally:
    db.close()
"@
        
        $seedScript | Out-File -FilePath "seed_data.py" -Encoding UTF8
        python seed_data.py
        Remove-Item "seed_data.py" -Force
        
        Write-Host "✅ Database seeded!" -ForegroundColor Green
    }
    
    "backup" {
        Write-Host "💾 Creating database backup..." -ForegroundColor Yellow
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        if (-not $BackupFile) {
            $BackupFile = "backup_$timestamp.sql"
        }
        
        # Extract connection details from URL
        if ($DB_URL -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
            $user = $matches[1]
            $password = $matches[2]
            $host = $matches[3]
            $port = $matches[4]
            $database = $matches[5]
            
            $env:PGPASSWORD = $password
            & pg_dump -h $host -p $port -U $user -d $database -f $BackupFile
            
            Write-Host "✅ Backup created: $BackupFile" -ForegroundColor Green
        } else {
            Write-Host "❌ Could not parse database URL" -ForegroundColor Red
        }
    }
    
    "restore" {
        if (-not $BackupFile -or -not (Test-Path $BackupFile)) {
            Write-Host "❌ Backup file not found: $BackupFile" -ForegroundColor Red
            return
        }
        
        if (-not $Force) {
            $confirmation = Read-Host "⚠️ This will overwrite existing data! Continue? (type 'YES' to confirm)"
            if ($confirmation -ne "YES") {
                Write-Host "Operation cancelled" -ForegroundColor Yellow
                return
            }
        }
        
        Write-Host "📥 Restoring database from backup..." -ForegroundColor Yellow
        
        # Extract connection details from URL
        if ($DB_URL -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
            $user = $matches[1]
            $password = $matches[2]
            $host = $matches[3]
            $port = $matches[4]
            $database = $matches[5]
            
            $env:PGPASSWORD = $password
            & psql -h $host -p $port -U $user -d $database -f $BackupFile
            
            Write-Host "✅ Database restored from: $BackupFile" -ForegroundColor Green
        } else {
            Write-Host "❌ Could not parse database URL" -ForegroundColor Red
        }
    }
}

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Database operation completed!" -ForegroundColor Cyan
