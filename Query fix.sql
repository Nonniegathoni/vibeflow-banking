-- Grant ALL permissions to everything in one go
GRANT ALL PRIVILEGES ON SCHEMA public TO vibeflow_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vibeflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vibeflow_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO vibeflow_user;

-- Make sure future tables/objects will also have proper permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vibeflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vibeflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO vibeflow_user;