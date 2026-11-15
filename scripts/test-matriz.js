/**
 * Ejecutor CLI de Pruebas de Seguridad y Validación
 * CampusGest-UPTC — Suite Automatizada
 */

import handler from '../api/solicitudes.js';

function createMockReqRes({ body, method = 'POST', headers = {} }) {
  const req = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body
  };
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) { this.headers[k] = v; return this; },
    status(code) { this.statusCode = code; return this; },
    json(data) {
      this.data = data;
      return this;
    },
    end(data) {
      this.data = data;
      return this;
    }
  };
  return { req, res };
}

async function runSecurityTests() {
  console.log('\n=============================================================');
  console.log('  CAMPUSGEST-UPTC — AUDITORÍA DE SEGURIDAD Y PRUEBAS        ');
  console.log('=============================================================\n');

  let passed = 0;
  let total = 10;

  // Test 1: Verificación estricta de Método HTTP (Rechazo de GET/PUT)
  {
    const { req, res } = createMockReqRes({ method: 'GET' });
    await handler(req, res);
    if (res.statusCode === 405 && res.data?.codigo === 'METODO_NO_PERMITIDO') {
      console.log('✓ [T01] Método HTTP estricto: APROBADO (Rechazó GET con HTTP 405)');
      passed++;
    } else {
      console.log(`✗ [T01] Método HTTP estricto: FALLIDO (Obtenido: ${res.statusCode})`);
    }
  }

  // Test 2: Validación estricta de código UPTC (9 dígitos exactos)
  {
    const { req, res } = createMockReqRes({
      body: {
        estudiante_nombre: 'Estudiante Prueba',
        codigo_uptc: '2024101', // 7 dígitos -> inválido
        email_institucional: 'estudiante@uptc.edu.co',
        tipo_tramite: 'Tutoria',
        descripcion: 'Solicitud con código inválido'
      }
    });
    await handler(req, res);
    if (res.statusCode === 400 && res.data?.campo === 'codigo_uptc') {
      console.log('✓ [T02] Validación código UPTC (9 dígitos): APROBADO (Rechazó 7 dígitos con HTTP 400)');
      passed++;
    } else {
      console.log('✗ [T02] Validación código UPTC: FALLIDO');
    }
  }

  // Test 3: Validación estricta de correo institucional (@uptc.edu.co)
  {
    const { req, res } = createMockReqRes({
      body: {
        estudiante_nombre: 'Estudiante Prueba',
        codigo_uptc: '202410123',
        email_institucional: 'estudiante@gmail.com', // Dominio comercial no permitido
        tipo_tramite: 'Tutoria',
        descripcion: 'Solicitud con correo comercial'
      }
    });
    await handler(req, res);
    if (res.statusCode === 400 && res.data?.campo === 'email_institucional') {
      console.log('✓ [T03] Validación correo institucional: APROBADO (Rechazó correo no UPTC con HTTP 400)');
      passed++;
    } else {
      console.log('✗ [T03] Validación correo institucional: FALLIDO');
    }
  }

  // Test 4: Validación de tipos de trámite permitidos (Whitelisting)
  {
    const { req, res } = createMockReqRes({
      body: {
        estudiante_nombre: 'Estudiante Prueba',
        codigo_uptc: '202410123',
        email_institucional: 'estudiante@uptc.edu.co',
        tipo_tramite: 'Invalido_Hack',
        descripcion: 'Trámite no soportado'
      }
    });
    await handler(req, res);
    if (res.statusCode === 400 && res.data?.campo === 'tipo_tramite') {
      console.log('✓ [T04] Whitelisting de trámites: APROBADO (Rechazó tipo no permitido con HTTP 400)');
      passed++;
    } else {
      console.log('✗ [T04] Whitelisting de trámites: FALLIDO');
    }
  }

  // Test 5: Rechazo de campos no autorizados (Prevención de Type / Mass Assignment Pollution)
  {
    const { req, res } = createMockReqRes({
      body: {
        estudiante_nombre: 'Estudiante Prueba',
        codigo_uptc: '202410123',
        email_institucional: 'estudiante@uptc.edu.co',
        tipo_tramite: 'Tutoria',
        descripcion: 'Intento de inyección de campo no autorizado',
        rol_privilegiado: 'admin' // Campo malicioso no permitido
      }
    });
    await handler(req, res);
    if (res.statusCode === 400 && res.data?.codigo === 'CAMPO_NO_PERMITIDO') {
      console.log('✓ [T05] Protección contra Mass Assignment: APROBADO (Rechazó campo no permitido con HTTP 400)');
      passed++;
    } else {
      console.log('✗ [T05] Protección contra Mass Assignment: FALLIDO');
    }
  }

  // Test 6: Validación de formato UUID en request_id de idempotencia
  {
    const { req, res } = createMockReqRes({
      body: {
        estudiante_nombre: 'Estudiante Prueba',
        codigo_uptc: '202410123',
        email_institucional: 'estudiante@uptc.edu.co',
        tipo_tramite: 'Tutoria',
        descripcion: 'Intento de UUID inválido',
        request_id: 'not-a-valid-uuid'
      }
    });
    await handler(req, res);
    if (res.statusCode === 400 && res.data?.campo === 'request_id') {
      console.log('✓ [T06] Formato UUID de Idempotencia: APROBADO (Rechazó UUID malformado con HTTP 400)');
      passed++;
    } else {
      console.log('✗ [T06] Formato UUID de Idempotencia: FALLIDO');
    }
  }

  // Test 7: Respuesta honesta de servicio no configurado (HTTP 503 sin simular éxitos falsos)
  {
    // Asegurarse de que N8N_WEBHOOK_URL no esté configurado
    delete process.env.N8N_WEBHOOK_URL;
    const { req, res } = createMockReqRes({
      body: {
        estudiante_nombre: 'Laura Marcela Gómez',
        codigo_uptc: '202410045',
        email_institucional: 'laura.gomez@uptc.edu.co',
        tipo_tramite: 'Tutoria',
        descripcion: 'Solicitud con datos válidos pero N8N aún pendiente de configurar'
      }
    });
    await handler(req, res);
    if (res.statusCode === 503 && res.data?.codigo === 'N8N_NO_CONFIGURADO') {
      console.log('✓ [T07] Respuesta honesta ante servicio no configurado: APROBADO (HTTP 503 Service Unavailable)');
      passed++;
    } else {
      console.log(`✗ [T07] Respuesta ante servicio no configurado: FALLIDO (Obtenido: HTTP ${res.statusCode})`);
    }
  }

  // Test 8: Validación de longitud mínima de descripción
  {
    const { req, res } = createMockReqRes({
      body: {
        estudiante_nombre: 'Laura Marcela Gómez',
        codigo_uptc: '202410045',
        email_institucional: 'laura.gomez@uptc.edu.co',
        tipo_tramite: 'Tutoria',
        descripcion: 'abc' // Menos de 5 caracteres
      }
    });
    await handler(req, res);
    if (res.statusCode === 400 && res.data?.campo === 'descripcion') {
      console.log('✓ [T08] Validación longitud descripción: APROBADO (Rechazó descripción corta con HTTP 400)');
      passed++;
    } else {
      console.log('✗ [T08] Validación longitud descripción: FALLIDO');
    }
  }

  // Test 9: Protección de encabezados CORS
  {
    const { req, res } = createMockReqRes({
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:5173' }
    });
    await handler(req, res);
    if (res.statusCode === 204 && res.headers['Access-Control-Allow-Methods']) {
      console.log('✓ [T09] Preflight OPTIONS CORS: APROBADO (HTTP 204 con métodos autorizados)');
      passed++;
    } else {
      console.log('✗ [T09] Preflight OPTIONS CORS: FALLIDO');
    }
  }

  // Test 10: Auditoría de SQL Parametrizado en N8N
  {
    const fs = await import('fs');
    const n8nJson = JSON.parse(fs.readFileSync('n8n/campusaid-workflow.json', 'utf8'));
    const postgresNode = n8nJson.nodes.find(n => n.name.includes('Postgres'));
    const isSafeParam = postgresNode?.parameters?.query?.includes('$1') && postgresNode?.parameters?.queryParams;
    if (isSafeParam) {
      console.log('✓ [T10] Auditoría N8N SQL Injection: APROBADO (Consulta parametrizada con $1...$10 sin interpolación cruda)');
      passed++;
    } else {
      console.log('✗ [T10] Auditoría N8N SQL Injection: FALLIDO');
    }
  }

  console.log('\n=============================================================');
  console.log(`  RESUMEN: ${passed} / ${total} PRUEBAS DE SEGURIDAD APROBADAS `);
  console.log('=============================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSecurityTests();
