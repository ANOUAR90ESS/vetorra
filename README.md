# Vetorre

Proyecto React + TypeScript + Vite con integración de Supabase y Google Gemini AI.

## Requisitos previos

- Node.js (versión 18 o superior)
- npm o yarn
- Cuenta de Supabase
- API Key de Google Gemini

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/TU_USUARIO/vetorre.git
cd vetorre
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Edita el archivo `.env.local` y agrega tus credenciales:
   - `GEMINI_API_KEY`: Obtén tu API key en [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Anon key de tu proyecto Supabase

## Desarrollo

Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Build

Genera la versión de producción:
```bash
npm run build
```

## Estructura del proyecto

```
vetorre/
├── components/          # Componentes React
│   └── demos/          # Componentes de demostración
├── services/           # Servicios (Supabase, Gemini, etc.)
├── server/             # Servidor backend
├── assets/             # Recursos estáticos
└── types.ts            # Definiciones de tipos TypeScript
```

## Tecnologías utilizadas

- React 19
- TypeScript
- Vite
- Supabase
- Google Gemini AI
- React Router
- Lucide React (iconos)

## Licencia

MIT
"# vetorre" 
"# vetorre" 
