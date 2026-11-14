-- PEHRA — PostgreSQL + PostGIS Production Schema
-- Production Disaster Management & Hyperlocal Early Warning Architecture

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. USERS & RBAC
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'CITIZEN',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    home_location GEOGRAPHY(Point, 4326),
    village_id VARCHAR(64),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(128),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_home_location ON users USING GIST (home_location);

-- 2. GEOGRAPHIC ENTITIES (VILLAGES, WARDS, GEO CELLS)
CREATE TABLE IF NOT EXISTS villages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    ward VARCHAR(64) NOT NULL,
    population INT NOT NULL DEFAULT 50000,
    area_km2 NUMERIC(8,2) NOT NULL DEFAULT 5.0,
    elevation_m NUMERIC(6,2) NOT NULL DEFAULT 8.5,
    geometry GEOGRAPHY(Polygon, 4326),
    center_point GEOGRAPHY(Point, 4326),
    drainage_capacity_mm_hr NUMERIC(6,2) DEFAULT 25.0,
    vulnerability_score NUMERIC(4,3) DEFAULT 0.500,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_villages_geometry ON villages USING GIST (geometry);
CREATE INDEX idx_villages_center ON villages USING GIST (center_point);

-- 3. DATA SOURCES & HEALTH
CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(64) NOT NULL,
    endpoint_url TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'HEALTHY',
    quality_score NUMERIC(4,2) DEFAULT 0.95,
    update_frequency_sec INT DEFAULT 300,
    freshness_seconds INT DEFAULT 120,
    is_simulation BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    last_successful_fetch TIMESTAMPTZ,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. OBSERVATIONS & TELEMETRY
CREATE TABLE IF NOT EXISTS observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(64) REFERENCES data_sources(id),
    source_type VARCHAR(64) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    location_name VARCHAR(128),
    value NUMERIC(10,3) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quality VARCHAR(32) DEFAULT 'GOOD',
    freshness_seconds INT DEFAULT 0,
    raw_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_observations_observed_at ON observations(observed_at DESC);
CREATE INDEX idx_observations_location ON observations USING GIST (location);

-- 5. INCIDENTS & FLOOD SPREAD
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    incident_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'MONITORING',
    severity VARCHAR(32) NOT NULL DEFAULT 'MODERATE',
    confidence NUMERIC(4,3) NOT NULL DEFAULT 0.850,
    origin_location GEOGRAPHY(Point, 4326) NOT NULL,
    origin_village_id VARCHAR(64) REFERENCES villages(id),
    origin_timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMPTZ,
    estimated_affected_people INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spread_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    cell_id VARCHAR(64) NOT NULL,
    cell_name VARCHAR(128) NOT NULL,
    eta_hours NUMERIC(5,2) NOT NULL,
    depth_m NUMERIC(5,2) NOT NULL,
    confidence NUMERIC(4,3) NOT NULL,
    source VARCHAR(32) NOT NULL DEFAULT 'PREDICTED',
    geometry GEOGRAPHY(Polygon, 4326),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spread_events_geom ON spread_events USING GIST (geometry);

-- 6. ALERTS & OPERATIONAL WORKFLOW
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id),
    stage VARCHAR(32) NOT NULL, -- WATCH, WARNING, CONFIRMED
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    confidence NUMERIC(4,3) NOT NULL,
    village_id VARCHAR(64) REFERENCES villages(id),
    target_geometry GEOGRAPHY(Polygon, 4326),
    shelter_id VARCHAR(64),
    evacuation_route_id VARCHAR(64),
    eta_hours NUMERIC(5,2) NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    model_version VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_acknowledgements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    device_id VARCHAR(128),
    acknowledged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    location GEOGRAPHY(Point, 4326),
    battery_pct INT
);

-- 7. SHELTERS & HOSPITALS
CREATE TABLE IF NOT EXISTS shelters (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    address TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 500,
    occupancy INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    contact_phone VARCHAR(32),
    contact_person VARCHAR(128),
    facilities TEXT[] DEFAULT ARRAY['Water', 'Food', 'Medical', 'Power'],
    accessibility BOOLEAN DEFAULT TRUE,
    medical_support BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    address TEXT NOT NULL,
    emergency_capacity INT NOT NULL DEFAULT 100,
    available_beds INT NOT NULL DEFAULT 40,
    ambulance_available INT NOT NULL DEFAULT 6,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    contact_phone VARCHAR(32),
    blood_bank BOOLEAN DEFAULT TRUE,
    trauma_center BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. CITIZEN REPORTS & FIELD OBSERVATIONS
CREATE TABLE IF NOT EXISTS flood_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_user_id UUID REFERENCES users(id),
    reporter_name VARCHAR(128) NOT NULL,
    reporter_phone VARCHAR(32),
    location GEOGRAPHY(Point, 4326) NOT NULL,
    address TEXT NOT NULL,
    village_id VARCHAR(64) REFERENCES villages(id),
    water_depth_m NUMERIC(5,2) NOT NULL,
    depth_category VARCHAR(32) NOT NULL,
    description TEXT,
    photo_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    impact_score NUMERIC(4,3) DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. DEVICE TELEMETRY (ALERT-SCOPED OPT-IN)
CREATE TABLE IF NOT EXISTS device_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(128) NOT NULL,
    user_id UUID REFERENCES users(id),
    location GEOGRAPHY(Point, 4326) NOT NULL,
    battery_pct INT NOT NULL,
    battery_status VARCHAR(32) NOT NULL,
    is_alert_scoped BOOLEAN DEFAULT TRUE,
    consent_granted BOOLEAN DEFAULT TRUE,
    relay_hop_count INT DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_telemetry_recorded_at ON device_telemetry(recorded_at DESC);

-- 10. AUDIT LOG (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64),
    before_state JSONB,
    after_state JSONB,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
