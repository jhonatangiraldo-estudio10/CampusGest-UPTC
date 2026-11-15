# 03 · Instalación en Linux (Bash)

[← Índice](../README.md) · [Windows](02-windows-powershell.md) · [Supabase →](04-supabase.md)

## 1. Verificar programas

```bash
git --version
node --version
npm --version
```

Instalar versiones compatibles desde los repositorios de la distribución o los sitios oficiales [Git](https://git-scm.com/downloads/linux) y [Node.js](https://nodejs.org/en/download).

## 2. Clonar y crear rama

Sustituir `USUARIO` y `RAMA_BASE`.

```bash
mkdir -p "$HOME/CampusAid"
cd "$HOME/CampusAid"
git clone https://github.com/USUARIO/campusaid-uptc.git
cd campusaid-uptc
git fetch origin
git switch RAMA_BASE
git pull --ff-only origin RAMA_BASE
git switch -c feature/integracion-supabase-n8n
```

## 3. Instalar dependencias

```bash
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm run
```

Iniciar solo el script disponible, por ejemplo `npm run dev`.

## 4. Variables locales

```bash
[ -f .env.example ] && cp .env.example .env.local
nano .env.local
```

Si no existe `.env.example`, pedir al responsable frontend la lista de variables antes de crearlas.

## 5. Versionar cambios

```bash
git status
git diff
git add -A
git status
git diff --cached --stat
git commit -m "feat: integrar supabase y n8n"
git push -u origin feature/integracion-supabase-n8n
```

Verificar primero que secretos y archivos `.env.local` no estén incluidos.

[← Índice](../README.md) · [Siguiente: Supabase →](04-supabase.md)
