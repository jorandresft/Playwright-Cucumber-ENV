
# Playwright-Cucumber-PO-Rerun-Parallel

Proyecto de Playwright integrando Cucumber, compartir Page Object, reporte HTML y HTML con gráficos y con captura de pantalla, rerun de casos fallidos, ejecución paralela y multiples ambientes

## Pasos para replicar el proyecto

Seguir el paso a paso

```bash
  Crear la carpeta del proyecto
```

En la ubicación del proyecto abrir una ventana de comando

```bash
  cmd
```

Instalar el paquete de Playwright

```bash
  npm init playwright@latest
```

Abrir el proyecto en Visual Studio Code

```bash
  code .
```

Eliminar la carpeta test y el archivo playwright.config.ts. Abrir una terminal e instalar los paquetes necesarios

```bash
  npm i @cucumber/cucumber -D
  npm i ts-node -D
  npm install multiple-cucumber-html-reporter --save-dev
  npm i fs-extra -D
  npm i dotenv -D
  npm i cross-env -D
```

crear las nuevas carpetas

```bash
  src/test/features
  src/test/steps
  src/hooks
  src/helper/browsers
  src/helper/env
  src/helper/types
```

Crear el archivo cucumber.json con la siguiente estructura

```bash
{
    "default": {
        "formatOptions": {
            "snippetInterface": "async-await"
        },
        "paths": [
            "src/test/features/*.feature"
        ],
        "dryRun": false,
        "require": [
            "src/test/steps/*.ts",
            "src/hooks/Hooks.ts"
        ],
        "requireModule": [
            "ts-node/register"
        ],
        "format": [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/report.json",
            "rerun:@rerun.txt"
        ],
        "parallel": 2
    },
    "rerun": {
        "formatOptions": {
            "snippetInterface": "async-await"
        },
        "dryRun": false,
        "require": [
            "src/test/steps/*.ts",
            "src/hooks/Hooks.ts"
        ],
        "requireModule": [
            "ts-node/register"
        ],
        "format": [
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/report.json",
            "rerun:@rerun.txt"
        ],
        "parallel": 2
    }
}
```

Para la ejecución en paralelo añadimos la siguiente linea en el archivo cucumber.json, despues de format

```bash
"parallel": 2
```

Modificar el archivo package.json en la sesión de scripts

```bash
"scripts": {
    "pretest": "npx ts-node src/helper/init.ts",
    "test": "cross-env ENV=prod cucumber-js test || (exit 0)",
    "posttest": "npx ts-node src/helper/report.ts",
    "test:failed": "cucumber-js -p rerun @rerun.txt",
    "report": "npx ts-node src/helper/report.ts"
  },
```

Si no se ha configurado el glue, hacer lo siguiente

```bash
  Control + ,
```

En search settings escribir cucumber y dar clic en Edit in settings.json y agregar lo siguiente

```bash
    "cucumber.glue": [
        "src/test/steps/*.ts"
    ],
```

En la carpeta hooks crear el archivo PageFixture.ts con la siguiente estructura

```bash
import { Page } from "@playwright/test";

export const pageFixture = {
    // @ts-ignore
    page: undefined as Page
}   
```

En la carpeta hooks crear el archivo Hooks.ts con la siguiente estructura

```bash
import { BeforeAll, After, Before, AfterAll, Status, AfterStep } from "@cucumber/cucumber";
import { chromium, Browser, Page, BrowserContext } from "@playwright/test";
import { pageFixture } from "./PageFixture";
import { invokeBrowser } from "../helper/browsers/BrowserManager";
import { getEnv } from "../helper/env/env";

let browser: Browser;
let context: BrowserContext;

BeforeAll (async function () {
    // Para obtener el ambiente 
    getEnv();
    // Para invocar el browser
    browser = await invokeBrowser();
});

Before (async function () {
    context = await browser.newContext();
    const page = await browser.newPage();
    pageFixture.page = page;
});

/*
// Screenshot whit failed
After (async function ({ pickle, result }) {
    console.log(result?.status);
    // Screenshot
    if(result?.status == Status.FAILED) {
        const img = await pageFixture.page.screenshot({ path: `./test-results/screenshots/${pickle.name}.png`, type: "png"});
        await this.attach(img, "image/png");
    }

    await pageFixture.page.close();
    await context.close();
});

// Screenshot fof step
AfterStep (async function ({ pickle, result }) {
    const img = await pageFixture.page.screenshot({ path: `./test-results/screenshots/${pickle.name}.png`, type: "png"});
    await this.attach(img, "image/png");
})
*/

After (async function ({ pickle }) {
    // Screenshot
    const img = await pageFixture.page.screenshot({ path: `./test-results/screenshots/${pickle.name}.png`, type: "png"});
    await this.attach(img, "image/png");
    await pageFixture.page.close();
    await context.close();
});

AfterAll (async function () {
    await browser.close();
});
```

En la carpeta helper crear el archivo report.ts con la siguiente estructura y según el proyecto

```bash
const report = require("multiple-cucumber-html-reporter");

report.generate({
  jsonDir: "test-results",
  reportPath: "test-results",
  reportName: "Playwright Automation Report",
  pageTitle: "Guru99",
  displayDuration: false,
  metadata: {
    browser: {
      name: "chrome",
      version: "127",
    },
    device: "JFT",
    platform: {
      name: "Windows",
      version: "10",
    },
  },
  customData: {
    title: "Test info",
    data: [
      { label: "Project", value: "Guru99 project" },
      { label: "Release", value: "1.2.3" },
      { label: "Cycle", value: "Smoke-1" }
    ],
  },
});
```

En la carpeta helper crear el archivo init.ts con la siguiente estructura

```bash
const fs = require ("fs-extra");

try {
    fs.ensureDir("test-results");
    fs.emptyDir("test-results");
} catch (error) {
    console.log ("Folder not created!" + error);
}
```

Dentro de la carpeta env crear el archivo .env.prod con la siguiente estructura

```bash
BASEURL = https://demo.guru99.com/V4/index.php
BROWSER = firefox
```

Dentro de la carpeta env crear el archivo .env.staging con la siguiente estructura

```bash
BASEURL = https://demo.guru99.com/V4/index.php
BROWSER = chrome
```

Dentro de la carpeta types crear el archivo  env.d.ts con la siguiente estructura

```bash
export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BROWSER: "chrome" | "firefox" | "webkit",
            ENV: "stating" | "prod" | "test",
            BASEURL: string,
            HEAD: "true" | "false"
        }
    }
}
```

Dentro de la carpeta browsers crear el archivo BrowserManager.ts con la siguiente estructura

```bash
import { chromium, firefox, LaunchOptions, webkit } from "@playwright/test"

const options: LaunchOptions = {
    headless: false,
}

export const invokeBrowser = () => {
    const browserType = process.env.BROWSER;
    switch (browserType) {
        case 'chrome':
            return chromium.launch(options);
        case 'firefox':
            return firefox.launch(options);
        case 'webkit':
            return webkit.launch(options);
        default:
            throw new Error("Please set the proper browser!");
    }
}
```

Dentro de la carpeta env crear el archivo env.ts con la siguiente estructura

```bash
import * as dotenv from 'dotenv'

export const getEnv = () => {
    dotenv.config({
        override: true,
        path: `src/helper/env/.env.${process.env.ENV}`
    })
}
```

Dentro de la raiz del proyecto crear el archivo tsconfig.json con la siguiente estructura

```bash
{
    "compilerOptions": {
        "typeRoots": [
            "./node_modules/@types",
            "src/helper/types"
        ]
    }
}
```

Crear los features y los steps según el proyecto.

## Ejecutar Tests

Para ejecutar los casos de prueba, abrir una terminal y copiar el comando

```bash
  npm run test
```

## Ejecutar Tests Fallidos

Para ejecutar los casos de prueba fallidos (rerun), abrir una terminal y copiar el comando

```bash
  npm run test:failed
```

## Generar Reporte con Gráficos

Para general el reporte HTML con gráficos, abrir una terminal y copiar el comando

```bash
  npm run report
```

## Github Actions

Se modifica el archivo BrowserManager.ts para que los navegadores se ejecuten en segundo plano

```bash
const options: LaunchOptions = {
    headless: true,
}
```

Cuando se realiza un push o pull request se ejecutan los casos de prueba y se genera el reporte. Crear las carpetas .github/workflows y dentro crear el archivo .yml con la siguiente estructura

```bash
Ej:
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 18
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Install Cucumber
      run: npm i @cucumber/cucumber -D
    - name: Install ts-node
      run: npm i ts-node -D
    - name: Install multiple-cucumber-html-reporter
      run: npm install multiple-cucumber-html-reporter --save-dev
    - name: Install fs-extra
      run: npm i fs-extra -D
    - name: Install dotenv
      run: npm i dotenv -D
    - name: Install cross-env
      run: npm i cross-env -D
    - name: Run Playwright tests
      run: npm run test
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: test-results/
        retention-days: 30
```

## Authors

- Jorge Franco