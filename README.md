# Belentani · AI Gateway CLI

**Generación de texto y vídeo mediante Vercel AI Gateway.** Este repositorio es una utilidad de línea de comandos, no un sitio web ni un proxy público. Su propósito es ofrecer entradas ejecutables y verificables para los modelos que el operador haya habilitado.

## Funciones

| Comando | Acción | Salida |
| --- | --- | --- |
| `npm run text -- "prompt"` | Genera texto con el modelo configurado | Salida estándar |
| `npm run video -- "prompt"` | Genera un vídeo con el modelo configurado | Archivo MP4 local |
| `npm test` | Comprueba ayuda y errores de configuración **sin gastar créditos** | Resultados del smoke test |

Cada comando requiere un identificador de modelo **real y actualizado** de https://ai-gateway.vercel.sh/v1/models. Los modelos, precios y disponibilidad cambian; no hay un modelo fijo en el código.

## Instalación

Requisitos: Node.js 22 o superior.

```bash
npm ci
cp .env.example .env
npm run text -- --help
npm run video -- --help
npm test
```

Configura `AI_GATEWAY_API_KEY` en el entorno privado, o utiliza `VERCEL_OIDC_TOKEN` dentro de un entorno Vercel autenticado. No subas secretos, tokens ni un archivo `.env`.

## Texto

En `.env`, define `AI_GATEWAY_MODEL` con el ID exacto `proveedor/modelo` (o un modelo virtual `vmc/identificador`) consultado en el catálogo.

```bash
npm run text -- "Explica los principios de un diseño accesible en español."
```

El programa valida argumentos, modelo y autenticación **antes** de iniciar una solicitud. Si la pasarela falla o no devuelve texto, termina con un código de error.

## Vídeo

Configura `AI_GATEWAY_VIDEO_MODEL` con un modelo apto para vídeo y, opcionalmente, `AI_GATEWAY_VIDEO_OUTPUT`.

```bash
npm run video -- "Plano secuencia de agua negra iluminada por luz blanca fría."
```

**Atención al coste:** el comando de vídeo inicia una generación real y puede consumir créditos. Solo debe ejecutarse deliberadamente. Si el archivo de salida existe, el programa no lo sobrescribe. La API de vídeo puede cambiar; verifica capacidades y límites del modelo.

## Calidad y publicación

- `npm test` prueba arranque y manejo de configuración sin credenciales ni solicitudes pagadas.
- No exponer este código como servicio público sin autenticación, rate limiting, presupuestos y logs sin secretos.
- La latencia y fiabilidad de los proveedores reales necesitan pruebas autorizadas independientes de estos smoke tests.
- Identidad: **Belentani / NOIACORE** — tecnología esencial, documentación precisa, ejecución mínima.

## Licencia

MIT, según [LICENSE](LICENSE).
