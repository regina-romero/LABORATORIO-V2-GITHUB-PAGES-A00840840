# Laboratorio 2

## Promoción controlada de `develop` a `staging` con GitHub Actions y GitHub Pages

---

## Propósito del laboratorio

En este laboratorio construirás una aplicación web mínima y practicarás una promoción entre entornos con controles visibles de calidad.

La meta no es solo publicar una app, sino entender que una promoción profesional implica:

- validación automática
- revisión previa
- separación entre integración y validación
- despliegue solo después de cumplir condiciones

---

## Resultados de aprendizaje

Al finalizar, deberías poder:

- explicar la diferencia entre `develop` y `staging`
- describir qué valida un pipeline antes de una promoción
- ejecutar `lint`, tests y build como compuertas de calidad
- usar un Pull Request para promover cambios de `develop` a `staging`
- publicar `staging` en GitHub Pages solo después de aprobar la promoción

---

## Idea central del laboratorio

En este laboratorio, la promoción no será:

`hice push a staging y ya`

La promoción será:

1. se trabaja en `develop`
2. se valida en `develop`
3. se abre un Pull Request desde `develop` hacia `staging`
4. el Pull Request ejecuta validaciones
5. si todo pasa, se aprueba y se hace merge
6. solo entonces `staging` se despliega en GitHub Pages

---

## Arquitectura mínima

```text
Tu laptop
  -> git push a develop
GitHub
  -> Actions: lint + test + build
  -> Pull Request develop -> staging
  -> Actions sobre el PR
  -> merge aprobado
  -> deploy de staging
GitHub Pages
  -> sitio publicado
```

---

## Requisitos

Necesitas:

- Git
- Node.js 20 o superior
- una cuenta de GitHub
- un repositorio público en GitHub

---

## Estructura esperada del proyecto

```text
deploy-v2-pages/
├─ .github/
│  └─ workflows/
│     └─ deploy-pages-controlled.yml
├─ src/
│  ├─ App.tsx
│  ├─ main.tsx
│  ├─ styles.css
│  └─ env.test.ts
├─ eslint.config.js
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ public/
```

---

## Parte A. Construcción de la aplicación

### Paso 1. Crear la app con Vite

```powershell
npm create vite@latest deploy-v2-pages -- --template react-ts
cd deploy-v2-pages
npm install
```

Si usas Linux o macOS:

```bash
npm create vite@latest deploy-v2-pages -- --template react-ts
cd deploy-v2-pages
npm install
```

---

### Paso 2. Instalar dependencias de testing y lint

```powershell
npm install -D vitest jsdom @testing-library/jest-dom globals @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh
```

---

### Paso 3. Ajustar `package.json`

Asegúrate de que `package.json` contenga scripts como estos:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest run",
    "ci": "npm run lint && npm run test && npm run build"
  }
}
```

Si Vite creó más scripts, puedes conservarlos, pero estos deben existir.

---

### Paso 4. Reemplazar `src/App.tsx`

Usa este contenido:

```tsx
import "./styles.css";

const environment = import.meta.env.VITE_PUBLIC_ENVIRONMENT || "local";
const version = import.meta.env.VITE_PUBLIC_VERSION || "dev-local";

const notes = [
  "Lint, tests y build como compuertas",
  "Promoción por Pull Request",
  "Despliegue de staging en GitHub Pages"
];

export default function App() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Laboratorio 2 · Promoción controlada</p>
        <h1>Release Board V2</h1>
        <p className="hero-copy">
          Aplicación mínima para practicar validación automática y promoción controlada entre entornos.
        </p>
      </section>

      <section className="grid">
        <article className="card card-accent">
          <h2>Entorno actual</h2>
          <p className="badge">{environment}</p>
          <p>Este valor cambia según el entorno que construye el pipeline.</p>
        </article>

        <article className="card">
          <h2>Versión visible</h2>
          <p className="mono">{version}</p>
          <p>Usaremos el SHA corto del commit para identificar qué versión llegó a staging.</p>
        </article>

        <article className="card">
          <h2>Qué controla el pipeline</h2>
          <ul>
            {notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
```

---

### Paso 5. Reemplazar `src/styles.css`

Usa este contenido:

```css
:root {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #e8eef7;
  background:
    radial-gradient(circle at top, #244b73 0%, #0f172a 45%, #07111f 100%);
  line-height: 1.5;
  font-weight: 400;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
}

.shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 20px 64px;
}

.hero {
  margin-bottom: 24px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.8rem;
  color: #93c5fd;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  font-size: clamp(2.2rem, 5vw, 4rem);
  margin-bottom: 12px;
}

.hero-copy {
  max-width: 720px;
  color: #cbd5e1;
  font-size: 1.05rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.card-accent {
  border-color: rgba(96, 165, 250, 0.45);
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: #1d4ed8;
  font-weight: 700;
  text-transform: uppercase;
}

.mono {
  font-family: "Consolas", "Courier New", monospace;
  color: #fde68a;
}

ul {
  padding-left: 18px;
  margin-bottom: 0;
}
```

---

### Paso 6. Ajustar `vite.config.ts`

Usa este contenido:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom"
  },
  base: process.env.VITE_BASE_PATH || "/"
});
```

---

### Paso 7. Crear `eslint.config.js`

Usa este contenido:

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist"]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true
        }
      ]
    }
  }
);
```

---

### Paso 8. Crear un test simple en `src/env.test.ts`

Usa este contenido:

```ts
import { describe, expect, it } from "vitest";

describe("release board environment", () => {
  it("uses local as default environment when no variable is provided", () => {
    const raw: string | undefined = undefined;
    const environment = raw || "local";
    expect(environment).toBe("local");
  });

  it("accepts staging as a visible environment", () => {
    const environment = "staging";
    expect(environment).toBe("staging");
  });
});
```

---

### Paso 9. Probar en local

Ejecuta:

```powershell
npm run lint
npm run test
npm run build
npm run dev
```

Verifica que la aplicación cargue correctamente en:

[http://localhost:5173](http://localhost:5173)

---

## Parte B. Preparación del repositorio

### Paso 10. Inicializar Git

```powershell
git init
git add .
git commit -m "feat: initial controlled-promotion app"
```

---

### Paso 11. Crear el repositorio en GitHub

1. Crea un repositorio público.
2. Conéctalo con tu proyecto local.

Ejemplo:

```powershell
git remote add origin TU_URL_DEL_REPOSITORIO
git branch -M main
git push -u origin main
```

---

### Paso 12. Crear ramas de trabajo

```powershell
git checkout -b develop
git push -u origin develop
git checkout -b staging
git push -u origin staging
git checkout develop
```

---

## Parte C. Configuración de GitHub

### Paso 13. Activar GitHub Pages

En tu repositorio entra a:

`Settings -> Pages`

Configura:

- Source: `GitHub Actions`

---

### Paso 14. Configurar protección de rama para `staging`

Entra a:

`Settings -> Branches`

Crea una regla de protección para `staging`.

Activa, si están disponibles:

- Require a pull request before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging

Como checks requeridos, después podrás seleccionar:

- `quality`

Si tu interfaz muestra nombres más específicos, selecciona el job de validación equivalente.

Objetivo de esta configuración:

- evitar push directo a `staging`
- obligar a pasar por Pull Request
- impedir merge si las validaciones fallan

---

## Parte D. Workflow controlado

### Paso 15. Crear `.github/workflows/deploy-pages-controlled.yml`

Usa este contenido:

```yaml
name: deploy-pages-controlled

on:
  pull_request:
    branches: [develop, staging]
  push:
    branches: [develop, staging]

permissions:
  contents: read

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run lint
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build develop preview
        if: github.ref == 'refs/heads/develop' || github.base_ref == 'develop'
        run: npm run build
        env:
          VITE_PUBLIC_ENVIRONMENT: dev
          VITE_PUBLIC_VERSION: ${{ github.sha }}
          VITE_BASE_PATH: /${{ github.event.repository.name }}/

      - name: Build staging candidate
        if: github.ref == 'refs/heads/staging' || github.base_ref == 'staging'
        run: npm run build
        env:
          VITE_PUBLIC_ENVIRONMENT: staging
          VITE_PUBLIC_VERSION: ${{ github.sha }}
          VITE_BASE_PATH: /${{ github.event.repository.name }}/

      - name: Upload develop artifact
        if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
        uses: actions/upload-artifact@v4
        with:
          name: develop-dist
          path: dist

  deploy-staging:
    if: github.ref == 'refs/heads/staging' && github.event_name == 'push'
    needs: quality
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build staging
        run: npm run build
        env:
          VITE_PUBLIC_ENVIRONMENT: staging
          VITE_PUBLIC_VERSION: ${{ github.sha }}
          VITE_BASE_PATH: /${{ github.event.repository.name }}/

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

### Paso 16. Subir la configuración a `develop`

```powershell
git checkout develop
git add .
git commit -m "feat: add controlled promotion workflow"
git push origin develop
```

---

### Paso 17. Verificar el pipeline en `develop`

En la pestaña `Actions`, verifica que:

- `quality` corre correctamente
- `Run lint` pasa
- `Run tests` pasa
- `Build develop preview` pasa
- se genera el artefacto `develop-dist`

En esta fase, `develop` todavía no se publica.

---

## Parte E. Promoción controlada

### Paso 18. Hacer un cambio visible en `develop`

Edita `src/App.tsx`.

Por ejemplo, modifica la lista así:

```tsx
const notes = [
  "Lint, tests y build como compuertas",
  "Promoción por Pull Request",
  "Despliegue de staging en GitHub Pages",
  "Cambio visible listo para promoción"
];
```

Sube el cambio:

```powershell
git add .
git commit -m "feat: add visible change for promotion"
git push origin develop
```

---

### Paso 19. Abrir Pull Request de `develop` hacia `staging`

En GitHub:

1. entra a `Pull requests`
2. crea un nuevo Pull Request
3. selecciona:
   - base: `staging`
   - compare: `develop`

Ese Pull Request representa la solicitud formal de promoción.

---

### Paso 20. Revisar las validaciones del Pull Request

Dentro del Pull Request, verifica que corra:

- `quality`
- `Run lint`
- `Run tests`
- `Build staging candidate`

Interpretación:

- el cambio todavía no está desplegado en `staging`
- primero debe demostrar que es apto para entrar en `staging`

Si algún check falla:

- no debes hacer merge
- primero debes corregir `develop`

---

### Paso 21. Aprobar y hacer merge del Pull Request

Cuando todos los checks estén en verde:

1. aprueba el Pull Request si estás trabajando con revisión
2. haz merge de `develop` hacia `staging`

Ese merge es el momento real de la promoción.

---

### Paso 22. Verificar el despliegue de `staging`

Después del merge, GitHub ejecutará:

- `quality`
- `deploy-staging`

Cuando termine:

1. entra a `Settings -> Pages`
2. abre la URL publicada

Debes ver:

- entorno `staging`
- versión asociada al commit promovido
- el cambio visible que antes existía solo en `develop`

---

## Qué significa exactamente “promoción” en este laboratorio

La promoción ocurre porque:

- el cambio nace en `develop`
- se valida ahí
- se somete a revisión mediante Pull Request
- vuelve a validarse como candidato de `staging`
- solo después de aprobarse entra a `staging`
- y solo al entrar a `staging` se publica

Eso es distinto a editar directamente `staging`.

---

## Entregables

Debes entregar lo siguiente:

### Entregable 1. URL del repositorio

Comparte la URL pública del repositorio.

### Entregable 2. URL del Pull Request de promoción

Comparte la URL del Pull Request `develop -> staging`.

### Entregable 3. Evidencia del pipeline en `develop`

Incluye una captura donde se vea:

- `Run lint`
- `Run tests`
- `Build develop preview`
- el artefacto `develop-dist`

### Entregable 4. Evidencia del Pull Request validado

Incluye una captura donde se vea:

- el Pull Request abierto
- los checks en verde

### Entregable 5. URL del sitio publicado

Comparte la URL de GitHub Pages correspondiente a `staging`.

### Entregable 6. Evidencia del sitio desplegado

Incluye una captura donde se vea:

- entorno `staging`
- la versión visible
- el cambio promovido

### Entregable 7. Reflexión breve

Responde en 6 a 10 líneas:

- qué diferencia hay entre hacer push a una rama y promover un cambio entre entornos
- qué rol cumple el Pull Request en este laboratorio
- qué rol cumplen `lint`, tests y build antes del despliegue

---

## Criterios de evaluación

### Criterio 1. Construcción local

Se espera que:

- la app corra en local
- `lint`, test y build funcionen

Valor sugerido: 20%

### Criterio 2. Repositorio y ramas

Se espera que:

- exista el repositorio
- existan `develop` y `staging`
- la estructura del proyecto sea consistente

Valor sugerido: 15%

### Criterio 3. Pipeline de calidad

Se espera que:

- el workflow exista
- `quality` ejecute `lint`, tests y build
- `develop` genere artefacto

Valor sugerido: 25%

### Criterio 4. Promoción controlada

Se espera que:

- exista un Pull Request `develop -> staging`
- los checks pasen antes del merge
- `staging` se despliegue solo después del merge

Valor sugerido: 25%

### Criterio 5. Comprensión conceptual

Se espera que el estudiante pueda explicar:

- diferencia entre push directo y promoción
- valor de las compuertas de calidad
- por qué `staging` no debería recibir cambios sin validación

Valor sugerido: 15%

---

## Lista de verificación final

- [ ] la app corre en local
- [ ] `npm run lint` funciona
- [ ] `npm run test` funciona
- [ ] `npm run build` funciona
- [ ] existe el workflow controlado
- [ ] `develop` genera el artefacto `develop-dist`
- [ ] se abrió un Pull Request de `develop` hacia `staging`
- [ ] el Pull Request pasó checks
- [ ] el merge disparó el despliegue de `staging`
- [ ] GitHub Pages muestra el cambio promovido

---

## Errores comunes

### El Pull Request no muestra checks

Revisa:

- que el workflow esté en el repositorio
- que el PR apunte realmente a `staging`
- que el workflow tenga `pull_request` para `staging`

### La página publicada aparece en blanco

Revisa:

- `vite.config.ts`
- la variable `VITE_BASE_PATH`

### `staging` se despliega sin PR

Revisa:

- la protección de rama
- que no estés haciendo push directo a `staging`

### Los tests fallan en GitHub pero no en local

Revisa:

- versión de Node
- archivos guardados
- dependencias realmente instaladas

---

## Cierre

Al completar este laboratorio no solo habrás publicado una app.

Habrás practicado un flujo más cercano a una entrega profesional:

- cambio en integración
- validación automática
- revisión de promoción
- aprobación
- despliegue a un entorno publicado

Ese es el punto de partida correcto para hablar después de staging, producción, rollback, secretos y servicios externos.

