--tabla estudiantes

CREATE TABLE estudiantes (
    id_estudiante UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    codigo_uptc VARCHAR(9) UNIQUE NOT NULL
        CHECK (codigo_uptc ~ '^[0-9]{9}$'),
    email_institucional VARCHAR(150) UNIQUE NOT NULL
        CHECK (email_institucional ~* '^[A-Z0-9._%+-]+@uptc\.edu\.co$'),
    programa_academico VARCHAR(120),
    semestre INTEGER CHECK (semestre BETWEEN 1 AND 20),
    telefono VARCHAR(20),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);
-- tabla de docentes

CREATE TABLE docentes (
    id_docente UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email_institucional VARCHAR(150) UNIQUE NOT NULL,
    departamento VARCHAR(100),
    especialidad VARCHAR(150),
    telefono VARCHAR(20),
    disponibilidad BOOLEAN DEFAULT TRUE
);
-- tabla de coordinadores

CREATE TABLE coordinadores (
    id_coordinador UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email_institucional VARCHAR(150) UNIQUE NOT NULL,
    area_responsable VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    telefono VARCHAR(20)
);
-- tabla principal de solicitudes

CREATE TABLE solicitudes_campus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    id_estudiante UUID NOT NULL
        REFERENCES estudiantes(id_estudiante),

    id_coordinador UUID
        REFERENCES coordinadores(id_coordinador),

    tipo_tramite VARCHAR(20) NOT NULL
        CHECK (tipo_tramite IN (
            'Tutoria',
            'Laboratorio',
            'Certificado'
        )),

    descripcion TEXT NOT NULL,

    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
        CHECK (estado IN (
            'Pendiente',
            'Asignada',
            'En proceso',
            'Aprobada',
            'Rechazada',
            'Finalizada',
            'Cancelada'
        )),

    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);
-- tabla de solicitudes de tutorías

CREATE TABLE solicitudes_tutorias (
    id_tutoria UUID PRIMARY KEY
        REFERENCES solicitudes_campus(id)
        ON DELETE CASCADE,

    id_docente UUID
        REFERENCES docentes(id_docente),

    asignatura VARCHAR(120) NOT NULL,
    tema VARCHAR(150),
    fecha_tutoria TIMESTAMPTZ,
    modalidad VARCHAR(20)
        CHECK (modalidad IN ('Presencial', 'Virtual')),
    observaciones TEXT
);
--tabla de laboratorios

CREATE TABLE laboratorios (
    id_laboratorio UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150),
    capacidad INTEGER CHECK (capacidad > 0),
    descripcion TEXT,
    recursos_disponibles TEXT,
    disponible BOOLEAN DEFAULT TRUE
);
--tabla de préstamos de laboratorios

CREATE TABLE prestamos_laboratorios (
    id_prestamo UUID PRIMARY KEY
        REFERENCES solicitudes_campus(id)
        ON DELETE CASCADE,

    id_laboratorio UUID NOT NULL
        REFERENCES laboratorios(id_laboratorio),

    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    motivo TEXT NOT NULL,
    cantidad_personas INTEGER NOT NULL
        CHECK (cantidad_personas > 0),

    CHECK (hora_fin > hora_inicio)
);
--tabla de solicitudes de certificados

CREATE TABLE solicitudes_certificados (
    id_certificado UUID PRIMARY KEY
        REFERENCES solicitudes_campus(id)
        ON DELETE CASCADE,

    tipo_certificado VARCHAR(100) NOT NULL,
    fecha_emision TIMESTAMPTZ,
    numero_certificado VARCHAR(50) UNIQUE,
    archivo_pdf TEXT
);
-- tabla de notificaciones

CREATE TABLE notificaciones (
    id_notificacion UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    id_solicitud UUID NOT NULL
        REFERENCES solicitudes_campus(id)
        ON DELETE CASCADE,

    mensaje TEXT NOT NULL,
    tipo_notificacion VARCHAR(30),
    canal VARCHAR(20) DEFAULT 'Correo',
    fecha_envio TIMESTAMPTZ DEFAULT NOW(),

    estado_envio VARCHAR(20) DEFAULT 'Pendiente'
        CHECK (estado_envio IN (
            'Pendiente',
            'Enviado',
            'Fallido'
        ))
);
--tabla de historial de estados


CREATE TABLE historial_solicitudes (
    id_historial UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    id_solicitud UUID NOT NULL
        REFERENCES solicitudes_campus(id)
        ON DELETE CASCADE,

    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20) NOT NULL,
    observacion TEXT,
    fecha_cambio TIMESTAMPTZ DEFAULT NOW()
);
