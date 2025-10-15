# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SV Conta Desktop API is a NestJS-based REST API for managing the SV Conta Desktop application. It provides version management, license processing with device fingerprinting, usage analytics tracking, and administrative capabilities.

## Development Commands

### Running the Application
```bash
npm run start:dev       # Development mode with hot reload
npm run start:debug     # Development mode with debugging enabled
npm run build           # Build for production
npm run start:prod      # Run production build
```

### Testing
```bash
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:cov        # Run tests with coverage report
npm run test:e2e        # Run end-to-end tests
```

### Code Quality
```bash
npm run lint            # Run ESLint with auto-fix
npm run format          # Format code with Prettier
```

### Database
The application uses PostgreSQL via TypeORM. Database migrations are located in `supabase/migrations/`. The schema includes:
- RLS (Row Level Security) policies for all tables
- Automatic timestamp triggers for `updated_at` columns
- Comprehensive indexes for performance

Apply migrations directly to your PostgreSQL database using `psql`:
```bash
psql -d your_database_name -f supabase/migrations/20251014034918_initial_schema.sql
```

## Architecture

### Module Structure
The application follows NestJS modular architecture with these key modules:

- **AuthModule** ([src/modules/auth/](src/modules/auth/)) - JWT-based authentication with Passport strategies (local and JWT)
- **VersionModule** ([src/modules/version/](src/modules/version/)) - Application version management and update checking
- **LicenseModule** ([src/modules/license/](src/modules/license/)) - License generation, validation, and device fingerprint management
- **AnalyticsModule** ([src/modules/analytics/](src/modules/analytics/)) - Usage event tracking and analytics
- **AdminModule** ([src/modules/admin/](src/modules/admin/)) - Administrative CRUD operations (protected by JWT)
- **HealthModule** ([src/modules/health/](src/modules/health/)) - Health check endpoints

### Database Configuration
Database configuration is handled by [DatabaseConfig](src/config/database.config.ts) which supports:
- **PostgreSQL** (production) - When `DATABASE_URL` environment variable is set
- **SQLite fallback** (development) - Uses `better-sqlite3` when `DATABASE_URL` is not set

TypeORM synchronization is enabled in development but disabled in production for safety.

### Entity-First Design
All database tables are defined as TypeORM entities in [src/entities/](src/entities/):
- Enums defined at entity level (UserRole, LicenseType, PaymentStatus, etc.)
- UUID primary keys using `uuid_generate_v4()`
- Automatic timestamps (`created_at`, `updated_at`)
- Foreign key relationships with cascade deletes

### License Processing Algorithm
The license system ([license.service.ts](src/modules/license/license.service.ts)) implements:
- **Device Fingerprint Format**: `##########-######` (10 digits, dash, 6 digits)
- **Unlock Code Generation**: 17-digit codes generated from device fingerprint + timestamp hash
- **Validation**: Checks unlock code, device fingerprint, expiration, and active status
- **License Types**: trial (30 days), basic (1 year), professional (1 year), enterprise (2 years)

### Authentication Flow
1. Default admin created on application startup (email: `admin@svconta.com`, configurable via env)
2. Login via [LocalStrategy](src/modules/auth/strategies/local.strategy.ts) validates credentials with bcrypt
3. JWT token issued with user ID, email, and role in payload
4. Protected routes use [JwtAuthGuard](src/modules/auth/guards/jwt-auth.guard.ts)
5. [JwtStrategy](src/modules/auth/strategies/jwt.strategy.ts) extracts and validates tokens from `Authorization: Bearer <token>` header

### API Structure
- Global prefix: `/api`
- Swagger documentation enabled in development at `/api/docs`
- Global validation pipe with DTO transformation
- Security: Helmet, CORS, compression, rate limiting

## Environment Variables

Required environment variables (create `.env` file):

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Default Admin (created on first run)
DEFAULT_ADMIN_EMAIL=admin@svconta.com
DEFAULT_ADMIN_PASSWORD=admin123

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Key Implementation Details

### Validation DTOs
All endpoints use class-validator DTOs. When creating new endpoints:
- Define DTOs in module's `dto/` directory
- Use decorators from `class-validator` and `class-transformer`
- Apply `@ApiProperty()` decorators for Swagger documentation

### TypeORM Patterns
- Inject repositories using `@InjectRepository(Entity)`
- Use `findOne()` with `where` clause for queries
- Include `relations` array to load foreign key references
- Always check entity existence before operations

### Error Handling
- Throw NestJS exceptions: `BadRequestException`, `NotFoundException`, `UnauthorizedException`
- Validation pipe automatically throws `BadRequestException` for invalid DTOs
- Add descriptive error messages for client debugging

### Swagger Tags
API endpoints are organized with these tags:
- `Authentication` - Admin login/logout
- `Versions` - Version management
- `Licenses` - License processing/validation
- `Analytics` - Event tracking
- `Health` - System health checks

## Common Patterns

### Adding a New Entity
1. Create entity file in [src/entities/](src/entities/) extending base TypeORM entity
2. Define columns with `@Column()`, relationships with `@ManyToOne()/@OneToMany()`
3. Export enums used by the entity
4. Add entity to TypeORM config in [database.config.ts](src/config/database.config.ts)
5. Create corresponding migration in `supabase/migrations/`

### Adding a Protected Endpoint
1. Create controller method with `@UseGuards(JwtAuthGuard)`
2. Extract user from request: `@Request() req` → `req.user`
3. Add `@ApiBearerAuth()` decorator for Swagger
4. Define DTO for request body/params

### Tracking Analytics Events
Use the AnalyticsService to log events:
- Event types defined in `analytics_event_type` enum
- Include device fingerprint, app version, and geolocation when available
- Events stored in `usage_analytics` table

## Database Schema Notes

### RLS Policies
Row Level Security is enabled on all tables but disabled for API access (see [20251014040000_disable_rls_for_api.sql](supabase/migrations/20251014040000_disable_rls_for_api.sql)). Policies are defined but not enforced for service role access.

### Key Tables
- **users** - Authentication and customer management
- **versions** - Application version releases with download URLs
- **licenses** - License keys linked to device fingerprints
- **sessions** - Active session tracking with geolocation
- **usage_analytics** - Event tracking with JSONB metadata
- **version_checks** - Version check request logs
- **license_validations** - License validation attempt logs
- **daily_stats** - Aggregated daily statistics

### Indexes
Comprehensive indexes exist on:
- Foreign keys (user_id, license_id, session_id)
- Lookup fields (email, device_fingerprint, unlock_code)
- Time-series fields (created_at, expires_at)
- Query filters (event_type, role, active)
