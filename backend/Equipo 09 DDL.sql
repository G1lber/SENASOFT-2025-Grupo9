-- DDL A.A.F.I. (Agente de Asesoría Financiera Inteligente)
-- Compatibilidad general: PostgreSQL / MySQL / SQL Server (ajustar tipos si aplica)
-- Convenciones: nombres en español, PK/FK/Índices explícitos, CHECKs cuando son portables.

-- Limpieza previa (orden seguro por dependencias)
DROP TABLE IF EXISTS ruta_contenido;
DROP TABLE IF EXISTS rutas_aprendizaje;
DROP TABLE IF EXISTS contenidos_educativos;
DROP TABLE IF EXISTS asignaciones_activos;
DROP TABLE IF EXISTS propuestas_inversion;
DROP TABLE IF EXISTS objetivos;
DROP TABLE IF EXISTS evaluaciones_conversacionales;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS instrumentos_financieros;
DROP TABLE IF EXISTS perfiles_riesgo;
DROP TABLE IF EXISTS bancos;

-- =======================
-- Catálogos
-- =======================

CREATE TABLE bancos (
  id_banco            INT PRIMARY KEY,
  nombre_banco        VARCHAR(120) NOT NULL UNIQUE,
  nit                 VARCHAR(20)  NOT NULL UNIQUE,
  swift               VARCHAR(11)  NULL,
  ciudad_sede         VARCHAR(60)  NOT NULL,
  tipo_banco          VARCHAR(20)  NOT NULL
  -- CHECK(tipo_banco IN ('Privado','Estatal')) -- habilitar en motores que soporten
);

CREATE INDEX idx_bancos_nombre ON bancos(nombre_banco);

CREATE TABLE perfiles_riesgo (
  id_perfil           INT PRIMARY KEY,
  nombre              VARCHAR(30)  NOT NULL UNIQUE,
  descripcion         VARCHAR(300) NOT NULL,
  volatilidad_min_pct DECIMAL(5,2) NOT NULL,
  volatilidad_max_pct DECIMAL(5,2) NOT NULL,
  horizonte_min_meses INT          NOT NULL,
  horizonte_max_meses INT          NOT NULL,
  rf_min_pct          INT          NOT NULL,
  rf_max_pct          INT          NOT NULL,
  rv_min_pct          INT          NOT NULL,
  rv_max_pct          INT          NOT NULL,
  liq_min_pct         INT          NOT NULL,
  liq_max_pct         INT          NOT NULL
);

CREATE INDEX idx_perfiles_nombre ON perfiles_riesgo(nombre);

CREATE TABLE instrumentos_financieros (
  id_instrumento          INT PRIMARY KEY,
  tipo_instrumento        VARCHAR(40)  NOT NULL,
  moneda                  VARCHAR(3)   NOT NULL DEFAULT 'COP',
  nivel_riesgo            VARCHAR(10)  NOT NULL,
  liquidez_dias           INT          NOT NULL DEFAULT 0,
  tasa_nominal_anual_pct  DECIMAL(6,2) NULL,
  comision_apertura_pct   DECIMAL(5,2) NULL,
  min_inversion_cop       BIGINT       NOT NULL,
  id_banco                INT          NULL,
  CONSTRAINT fk_ins_banco FOREIGN KEY (id_banco) REFERENCES bancos(id_banco)
);

CREATE INDEX idx_instr_tipo ON instrumentos_financieros(tipo_instrumento);
CREATE INDEX idx_instr_banco ON instrumentos_financieros(id_banco);

-- =======================
-- Core de usuarios y evaluación
-- =======================

CREATE TABLE usuarios (
  id_usuario                INT PRIMARY KEY,
  nombres                   VARCHAR(80)  NOT NULL,
  apellidos                 VARCHAR(80)  NOT NULL,
  cedula                    VARCHAR(12)  NOT NULL UNIQUE,
  fecha_nacimiento          DATE         NOT NULL,
  genero                    CHAR(1)      NOT NULL,
  ciudad                    VARCHAR(60)  NOT NULL,
  departamento              VARCHAR(60)  NOT NULL,
  direccion                 VARCHAR(120) NOT NULL,
  email                     VARCHAR(120) NOT NULL UNIQUE,
  celular                   VARCHAR(20)  NOT NULL,
  nivel_conocimiento        VARCHAR(15)  NOT NULL,
  estrato                   INT          NOT NULL,
  ingresos_mensuales_cop    BIGINT       NOT NULL,
  sarlaft_ok                CHAR(1)      NOT NULL DEFAULT 'S',
  es_pep                    CHAR(1)      NOT NULL DEFAULT 'N'
);

CREATE INDEX idx_usuarios_ciudad ON usuarios(ciudad);
CREATE INDEX idx_usuarios_email  ON usuarios(email);

CREATE TABLE evaluaciones_conversacionales (
  id_evaluacion         INT PRIMARY KEY,
  id_usuario            INT          NOT NULL,
  fecha                 DATE         NOT NULL,
  score_riesgo          INT          NOT NULL,
  score_aversion_perdida INT         NOT NULL,
  horizonte_meses       INT          NOT NULL,
  experiencia_previa    VARCHAR(10)  NOT NULL,
  coherencia_respuestas DECIMAL(3,2) NOT NULL,
  canal                 VARCHAR(10)  NOT NULL,
  id_perfil_sugerido    INT          NOT NULL,
  CONSTRAINT fk_eval_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  CONSTRAINT fk_eval_perfil  FOREIGN KEY (id_perfil_sugerido) REFERENCES perfiles_riesgo(id_perfil)
);

CREATE INDEX idx_eval_usuario_fecha ON evaluaciones_conversacionales(id_usuario, fecha);

CREATE TABLE objetivos (
  id_objetivo         INT PRIMARY KEY,
  id_usuario          INT          NOT NULL,
  tipo_objetivo       VARCHAR(40)  NOT NULL,
  monto_meta_cop      BIGINT       NOT NULL,
  fecha_meta          DATE         NOT NULL,
  prioridad           INT          NOT NULL,
  es_flexible         CHAR(1)      NOT NULL DEFAULT 'N',
  descripcion         VARCHAR(300) NULL,
  CONSTRAINT fk_obj_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE INDEX idx_obj_usuario ON objetivos(id_usuario);
CREATE INDEX idx_obj_fecha   ON objetivos(fecha_meta);

-- =======================
-- Propuestas y asignaciones
-- =======================

CREATE TABLE propuestas_inversion (
  id_propuesta          INT PRIMARY KEY,
  id_usuario            INT          NOT NULL,
  id_evaluacion         INT          NOT NULL,
  id_perfil             INT          NOT NULL,
  id_objetivo_principal INT          NOT NULL,
  fecha_propuesta       DATE         NOT NULL,
  horizonte_meses       INT          NOT NULL,
  score_confianza       DECIMAL(3,2) NOT NULL,
  justificacion         VARCHAR(800) NOT NULL,
  CONSTRAINT fk_prop_usuario   FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  CONSTRAINT fk_prop_eval      FOREIGN KEY (id_evaluacion) REFERENCES evaluaciones_conversacionales(id_evaluacion),
  CONSTRAINT fk_prop_perfil    FOREIGN KEY (id_perfil) REFERENCES perfiles_riesgo(id_perfil),
  CONSTRAINT fk_prop_objetivo  FOREIGN KEY (id_objetivo_principal) REFERENCES objetivos(id_objetivo)
);

CREATE INDEX idx_prop_usuario_fecha ON propuestas_inversion(id_usuario, fecha_propuesta);

CREATE TABLE asignaciones_activos (
  id_asignacion       INT PRIMARY KEY,
  id_propuesta        INT          NOT NULL,
  id_instrumento      INT          NOT NULL,
  porcentaje          DECIMAL(5,2) NOT NULL,
  monto_estimado_cop  BIGINT       NOT NULL,
  rebalanceo_meses    INT          NOT NULL,
  CONSTRAINT fk_asig_prop FOREIGN KEY (id_propuesta) REFERENCES propuestas_inversion(id_propuesta),
  CONSTRAINT fk_asig_inst FOREIGN KEY (id_instrumento) REFERENCES instrumentos_financieros(id_instrumento)
);

CREATE INDEX idx_asig_propuesta   ON asignaciones_activos(id_propuesta);
CREATE INDEX idx_asig_instrumento ON asignaciones_activos(id_instrumento);

-- =======================
-- Educación
-- =======================

CREATE TABLE contenidos_educativos (
  id_contenido     INT PRIMARY KEY,
  nivel            VARCHAR(15)  NOT NULL,
  tema             VARCHAR(120) NOT NULL,
  formato          VARCHAR(12)  NOT NULL,
  url              VARCHAR(200) NOT NULL,
  duracion_min     INT          NOT NULL,
  proveedor        VARCHAR(60)  NULL,
  certificable     CHAR(1)      NOT NULL DEFAULT 'N'
);

CREATE INDEX idx_cont_nivel ON contenidos_educativos(nivel);

CREATE TABLE rutas_aprendizaje (
  id_ruta           INT PRIMARY KEY,
  id_usuario        INT         NOT NULL,
  nivel_asignado    VARCHAR(15) NOT NULL,
  fecha_asignacion  DATE        NOT NULL,
  CONSTRAINT fk_ruta_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE INDEX idx_ruta_usuario ON rutas_aprendizaje(id_usuario);

CREATE TABLE ruta_contenido (
  id_ruta       INT NOT NULL,
  id_contenido  INT NOT NULL,
  orden         INT NOT NULL,
  PRIMARY KEY (id_ruta, id_contenido),
  CONSTRAINT fk_rc_ruta     FOREIGN KEY (id_ruta) REFERENCES rutas_aprendizaje(id_ruta),
  CONSTRAINT fk_rc_contenido FOREIGN KEY (id_contenido) REFERENCES contenidos_educativos(id_contenido)
);

-- =======================
-- Notas de cumplimiento (comentarios)
-- =======================
-- - Datos personales bajo Ley 1581 de 2012 (Habeas Data). Implementar ARCO.
-- - DIAN: retención en la fuente sobre rendimientos; considerar GMF (4x1000) a nivel de reportes.
-- - SARLAFT: campos sarlaft_ok y es_pep en USUARIOS; revisar casos 'N' y 'S' respectivamente.
-- - Fechas en COT; moneda COP.
