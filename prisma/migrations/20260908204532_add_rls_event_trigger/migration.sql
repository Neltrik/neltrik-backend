-- ✅ Instalar extensión necesaria (opcional)
CREATE EXTENSION IF NOT EXISTS plpgsql;

-- ✅ Función que se ejecuta cuando se crea una nueva tabla
CREATE OR REPLACE FUNCTION enable_rls_on_new_table()
RETURNS event_trigger AS $$
DECLARE
    table_name text;
    obj record;
BEGIN
    -- ✅ Iterar sobre las tablas creadas en este evento
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() 
        WHERE command_tag = 'CREATE TABLE'
    LOOP
        table_name := obj.objid::regclass::text;
        
        -- ✅ Verificar si la tabla tiene columna tenant_id
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_name 
            AND column_name = 'tenant_id'
        ) THEN
            -- ✅ Activar RLS
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', table_name);
            
            -- ✅ Crear política de tenant isolation
            EXECUTE format('
                CREATE POLICY tenant_isolation_policy ON %I
                USING (tenant_id = current_setting(''app.current_tenant_id'', true)::uuid);
            ', table_name);
            
            RAISE NOTICE '✅ RLS activado automáticamente en tabla: %', table_name;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ✅ Crear el event trigger
CREATE EVENT TRIGGER enable_rls_on_new_table_trigger
ON ddl_command_end
WHEN TAG IN ('CREATE TABLE')
EXECUTE FUNCTION enable_rls_on_new_table();

-- ✅ Verificar que el trigger está activo
SELECT 
    evtname AS trigger_name,
    evtevent AS event,
    evttags AS tags
FROM pg_event_trigger
WHERE evtname = 'enable_rls_on_new_table_trigger';