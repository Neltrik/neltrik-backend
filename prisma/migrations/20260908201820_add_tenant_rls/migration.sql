-- ✅ Activar RLS para TODAS las tablas con columna tenant_id
DO $$ 
DECLARE 
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT DISTINCT t.tablename 
        FROM pg_tables t
        JOIN information_schema.columns c ON c.table_name = t.tablename
        WHERE t.schemaname = 'public' 
        AND c.column_name = 'tenant_id'
        AND t.tablename NOT IN ('_prisma_migrations')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', table_name);
        EXECUTE format('
            CREATE POLICY tenant_isolation_policy ON %I
            USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);
        ', table_name);
    END LOOP;
END $$;