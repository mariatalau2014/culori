# Shopping List Application - Agent Documentation

## Overview
Aplicație web simplă pentru managementul listelor de cumpărături, construită cu HTML/CSS/JavaScript și Supabase ca backend.

## Architecture

### Frontend
- **Single HTML page** cu JavaScript inline
- **Vanilla CSS** pentru styling modern
- **Fără framework** - aplicație simplă, standalone

### Backend (Supabase)
- **Project ID**: `ywbmnkleicpokpnwkija`
- **API Key**: `sb_publishable_3Eoi2E9K_EFFvdj7PwAAgQ_CdwFKgeV`

## Database Schema

### Tables

#### `shopping_lists`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | List name |
| code | TEXT | Unique shareable code |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `categories`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| list_id | UUID | FK to shopping_lists |
| name | TEXT | Category name (e.g., "Lactate", "Panificație") |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### `items`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| category_id | UUID | FK to categories |
| text | TEXT | Item description |
| completed | BOOLEAN | Checked off status |
| created_at | TIMESTAMPTZ | Creation timestamp |

## URL Structure
- `/shopping-list/index.html` - Main application
- `/shopping-list/index.html?code=ABC123` - Access shared list

## Key Features
1. Create new shopping lists
2. Share lists via unique code in URL
3. Add items with category assignment
4. Mark items as completed
5. Real-time sync between users
