import sqlite3
import os

# Ruta de la base de datos
db_path = './runtime/data/crm_campaigns.db'

# Crear carpeta si no existe
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Conectar a la base de datos SQLite
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print('🔧 Creando tablas de oportunidades y reuniones...')

# Crear tabla opportunities
cursor.execute("""
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    proposed_solution TEXT,
    offer_presented INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);
""")
print('✅ Tabla opportunities creada')

# Crear tabla meetings
cursor.execute("""
CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    opportunity_id TEXT NOT NULL,
    meeting_type TEXT NOT NULL,
    meeting_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);
""")
print('✅ Tabla meetings creada')

# Crear índices para mejorar el rendimiento
cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_opportunities_contact_id ON opportunities(contact_id);
""")
print('✅ Índice idx_opportunities_contact_id creado')

cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
""")
print('✅ Índice idx_opportunities_status creado')

cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_meetings_opportunity_id ON meetings(opportunity_id);
""")
print('✅ Índice idx_meetings_opportunity_id creado')

cursor.execute("""
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
""")
print('✅ Índice idx_meetings_date creado')

# Agregar columna email_incorrect a campaigns si no existe
try:
    cursor.execute("""
    ALTER TABLE campaigns ADD COLUMN email_incorrect INTEGER DEFAULT 0;
    """)
    print('✅ Columna email_incorrect agregada a campaigns')
except sqlite3.OperationalError as e:
    if 'duplicate column name' in str(e).lower():
        print('ℹ️  Columna email_incorrect ya existe en campaigns')
    else:
        print(f'⚠️  Error al agregar columna email_incorrect: {e}')

# Confirmar cambios y cerrar conexión
conn.commit()
conn.close()

print('\n🎉 Base de datos actualizada correctamente')
print(f'📍 Ubicación: {os.path.abspath(db_path)}')