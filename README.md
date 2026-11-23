# Zona Muerta

*Runner* de acción y supervivencia zombi para navegador (HTML5 Canvas y Web Audio). Para jugar en escritorio y en móvil en horizontal.

> Este repositorio contiene la reingeniería del juego. El informe de auditoría, los cambios y las pruebas están en **[AUDITORIA.md](AUDITORIA.md)**, y las capturas de antes y después en `docs/capturas/`.

## Cómo jugar

| Acción | Teclado y ratón | Táctil |
|---|---|---|
| Moverse | A / D o ← → | ◀ ▶ |
| Saltar y doble salto | W, Espacio o ↑ | ▲ (dos toques) |
| Deslizarse y caída rápida | S o ↓ | ▼ |
| Disparar | J, F, K o clic (mantener) | FUEGO (mantener) |
| Cambiar arma | Q / E · **1 a 7** directo | ARMA |
| Recargar | R | automático |
| Pausa | P / Esc | ❚❚ |
| Jugar, reintentar o continuar | Enter | — |

## Ejecutar

No necesita instalación ni servidor:

- **Versión de desarrollo:** abre `game/index.html` en el navegador.
- **Versión de entrega en un solo archivo:** abre `dist/zona_muerta.html`.

Opcional: con `?q=0`, `?q=1` o `?q=2` en la URL se fija la calidad gráfica de los personajes. Por defecto es adaptativa.

## Desplegar

`dist/zona_muerta.html` es autónomo. Súbelo a cualquier alojamiento estático (GitHub Pages, Netlify, S3, itch.io como juego HTML, etc.) o comparte el archivo directamente. Si prefieres desplegar la versión modular, sube la carpeta `game/` completa.

## Desarrollo

```bash
node tools/build.js             # genera dist/zona_muerta.html a partir de game/
npm i -D playwright             # sólo para las pruebas (si no está instalado)
node tests/gameplay.test.js     # 46 pruebas funcionales en Chromium (escritorio + móvil)
node tests/gameplay.test.js dist/zona_muerta.html   # mismas pruebas sobre el empaquetado
```

### Estructura

```
game/
  index.html        marcado de HUD, menús y controles táctiles
  css/style.css     estilos de interfaz
  js/core.js        utilidades, constantes y almacenamiento
  js/fx.js          sprites cacheados, compositor de personajes y calidad adaptativa
  js/audio.js       síntesis de sonido y música adaptativa
  js/input.js       teclado, ratón y táctil
  js/world.js       capas del escenario, zonas y redimensionado
  js/data.js        armas, zombis y jefes
  js/state.js       estado de partida y utilidades de colisión
  js/player.js      jugador, armas y disparo
  js/spawn.js       aparición de enemigos, obstáculos y recogidas
  js/bosses.js      IA de los 25 jefes
  js/combat.js      daño, muertes y explosiones
  js/update.js      bucle de simulación
  js/actors.js      dibujo de jugador, zombis y jefes
  js/render.js      dibujo de la escena y posprocesado
  js/ui.js          HUD, menús y pantallas
  js/main.js        bucle principal
original/           juego original sin modificar (respaldo)
dist/               versión empaquetada en un archivo
tests/              pruebas automatizadas
tools/build.js      empaquetador
docs/capturas/      capturas de antes y después
```
