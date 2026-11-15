# 02 · Instalación en Windows (PowerShell)

[← Índice](../README.md) · [Inicio rápido](01-inicio-rapido.md) · [Linux →](03-linux.md)

## 1. Verificar programas

```powershell
git --version
node --version
npm --version
```

Si falta algún programa, instalarlo desde [Git](https://git-scm.com/downloads/win) o [Node.js](https://nodejs.org/en/download) y reiniciar PowerShell.

## 2. Clonar y crear rama

Reemplazar `USUARIO` y `RAMA_BASE` (normalmente `main`).

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\Documents\CampusAid" | Out-Null
Set-Location "$HOME\Documents\CampusAid"
git clone https://github.com/USUARIO/campusaid-uptc.git
Set-Location .\campusaid-uptc
git fetch origin
git switch RAMA_BASE
git pull --ff-only origin RAMA_BASE
git switch -c feature/integracion-supabase-n8n
```

## 3. Instalar dependencias y ejecutar

```powershell
if (Test-Path package-lock.json) { npm ci } else { npm install }
npm run
```

Ejecutar el script indicado por `npm run`; por ejemplo, **solo si existe**:

```powershell
npm run dev
```

## 4. Configurar variables locales

```powershell
if (Test-Path .env.example) { Copy-Item .env.example .env.local }
notepad .env.local
```

Consultar [Supabase](04-supabase.md) y [N8N](05-n8n.md). No escribir claves privadas dentro de variables `VITE_` ni subir `.env.local`.

## 5. Verificar cambios y enviarlos

```powershell
git status
git diff
git add -A
git status
git diff --cached --stat
git commit -m "feat: integrar supabase y n8n"
git push -u origin feature/integracion-supabase-n8n
```

**Antes de `git add -A`:** comprobar con `git status` que `.env.local`, claves privadas y archivos personales estén ignorados. Si aparecen, actualizar `.gitignore` y retirarlos del staging.

[← Índice](../README.md) · [Siguiente: Linux →](03-linux.md)
