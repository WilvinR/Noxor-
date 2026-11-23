# Zona Muerta: auditoría y reingeniería

Documento de entrega: estado inicial, cambios realizados, pruebas y pendientes.
Las capturas de antes y después están en `docs/capturas/`.

---

## 1. Inventario del proyecto original

| Aspecto | Hallazgo |
|---|---|
| Formato | Un solo `Zona_Muerta_2.html` de 130 KB y 1 275 líneas, con el JS minificado a mano en líneas de hasta 900 caracteres |
| Tecnología | HTML5 Canvas 2D y Web Audio API, sin motor ni librerías. Fuentes Teko y Rajdhani desde Google Fonts |
| Gráficos | Todo procedural: no hay imágenes, el escenario se genera en lienzos y los personajes se dibujan con trazos |
| Sonido | Síntesis en tiempo real: disparos, explosiones, gruñidos, música adaptativa y ambiente |
| Género | *Runner* de desplazamiento lateral con disparo, 7 armas, 6 tipos de zombi, 25 jefes con ciclo de rondas, obstáculos, botiquines, combos, récord en `localStorage`, controles táctiles y de teclado |

**Funcionalidades inventariadas y conservadas:** las 7 armas con sus balísticas (perforación, perdigones, cohete, llamas), recarga, autoapuntado, los 6 zombis y su IA, los 25 jefes con sus 14 ataques, los 5 obstáculos, las recogidas, combos y puntuación, niveles cada 400 m, el récord guardado, la pausa automática al cambiar de pestaña, la pantalla completa con bloqueo de orientación, el aviso de girar el móvil, la vibración al recibir daño, el sonido y la música. **No se eliminó ninguna funcionalidad.**

---

## 2. Evaluación crítica del original (1 a 10)

Se ejecutó el original con Chromium y Playwright en escritorio (1280×720) y en móvil (iPhone 13, en horizontal y en vertical), y se registraron consola, FPS y capturas.

| Área | Nota | Qué estaba mal y cómo afectaba al jugador |
|---|:-:|---|
| Calidad visual | 4 | Escena casi negra y sin contraste (viñeta al 85 %). Una sola paleta naranja-negra durante toda la partida. Los planos de fondo no se separan entre sí. Resultado: monotonía y fatiga visual. |
| Diseño de personajes | 3 | Figuras de palitos: extremidades del mismo grosor de cadera a tobillo, torso de una sola línea, sin contorno. El jugador, verde oliva oscuro, se pierde sobre un fondo oscuro. Los zombis se distinguen sobre todo por el color. |
| Escenarios | 5 | El parallax estaba bien planteado, pero sin perspectiva atmosférica. Los carteles «PELIGRO» se dibujaban a escala de primer plano en un plano intermedio y parecían flotar. No había primer plano. |
| Animaciones | 5 | El ciclo de carrera era correcto. El salto tenía una sola pose rígida, el aterrizaje no tenía peso y los zombis caminaban sin balanceo. |
| Jugabilidad | 6 | El núcleo funciona (correr, saltar, deslizar, disparar y jefes con avisos). Los fallos eran de pulido, no de diseño. |
| Controles | 5 | Si se pulsaba saltar justo antes de aterrizar, la pulsación se perdía. En portátiles táctiles el disparo con ratón se quedaba bloqueado. Soltar A con ← aún pulsada paraba al personaje. Las teclas no se liberaban al perder el foco. No se podía elegir arma directamente. |
| Física y colisiones | 6 | Las colisiones con barrido para balas rápidas eran correctas. Error: el temporizador `slideHold` no estaba inicializado y la primera prolongación del deslizamiento nunca funcionaba. |
| Interfaz | 5 | El consejo se superponía a la barra del jefe (comprobado en captura). Los controles del menú eran una línea de texto densa. La pausa no mostraba los controles. |
| Experiencia de usuario | 5 | Sin Enter para jugar, consejos de tutorial en mitad del combate contra el jefe y ninguna sensación de progresión visual entre niveles. |
| Rendimiento | 5 | Cientos de `createRadialGradient` por fotograma (cada luz, brillo, partícula de fuego y llama). Al redimensionar en móvil se reconstruían todas las capas en cada evento. |
| Calidad técnica | 3 | Código minificado a mano en un único archivo y prácticamente imposible de mantener. Error de color: `shade("#777")` interpretaba los colores de 3 dígitos como azul, y por eso el gancho del Carnicero salía azul. Un `setTimeout` podía mostrar un anuncio después de terminar la partida. |

---

## 3. Cambios realizados

### 3.1 Arquitectura
- `game/` contiene el código separado en 16 módulos con responsabilidades claras (`core`, `fx`, `audio`, `input`, `world`, `data`, `state`, `player`, `spawn`, `bosses`, `combat`, `update`, `actors`, `render`, `ui`, `main`) más `css/style.css`. El código está formateado y legible, y los sistemas nuevos llevan comentarios.
- Siguen siendo scripts clásicos, así que el juego **sigue abriéndose con doble clic** (`file://`) sin servidor.
- `tools/build.js` genera `dist/zona_muerta.html`, un único archivo autónomo como el original.
- El original está intacto en `original/zona_muerta_original.html`.

### 3.2 Personajes
- **Compositor de actores** (`fx.js`): cada personaje se dibuja en un lienzo auxiliar y se compone con contorno oscuro de silueta, *rim light* del color de la zona y sombreado volumétrico (luz cálida arriba y pies en sombra). Así se leen sobre cualquier fondo y quedan integrados en la iluminación. Los brillos de ojos y visor se pintan por encima del contorno.
- **Protagonista rediseñado**: extremidades cónicas con volumen, chaqueta con hombros y pecho, chaleco táctico con portacargadores, cinturón, rodilleras, botas con puntera, casco con ala, máscara con visor luminoso y filtro, mochila con saco de dormir y una **bufanda roja que ondea según la velocidad** (silueta reconocible y acento de color de la marca). Tiene un 14 % más de tamaño, y su caja de colisión se escaló en la misma proporción.
- **Animación**: tres poses de salto (subida, doble salto con rodillas recogidas, caída preparando el aterrizaje), compresión al aterrizar e inclinación al correr.
- **Zombis rediseñados**: cuerpo con volumen, camisa con bajo deshilachado, costillas expuestas, mandíbula colgante animada con dientes, cuencas de los ojos, manos en garra, manga rota y cojera al andar. El blindado lleva chaleco con placas y el rótulo «POLICÍA». La escala y las colisiones son coherentes con las del jugador.
- **Jefes**: pasan por el compositor (contorno y rim light) y se corrigió el color del gancho. La paleta del Carnicero se oscureció para que no se confunda con el destello de impacto.

### 3.3 Escenarios
- **Cuatro zonas** que cambian con cada nivel, con un fundido de 3 s: Ciudad en llamas, Distrito tóxico, Puerto nocturno y Zona roja. Cada zona tiene su propio cielo, resplandor de horizonte, luna y luz de borde de los personajes.
- **Perspectiva atmosférica**: neblina del color de la zona entre los planos de parallax, de modo que los planos lejanos se aclaran y los cercanos se oscurecen.
- **Capa de primer plano** con escombros y varillas a 1,35× de velocidad para dar profundidad sin tapar al jugador.
- El decorado intermedio se dibuja a la escala de su plano, y los carteles tienen dos postes y zapata en el suelo.
- La viñeta pasa del 85 % al 62 % y la luna se desplaza para que no quede tapada por el panel de arma.

### 3.4 Controles y jugabilidad
- **Búfer de salto** de 130 ms (el salto pulsado justo antes de aterrizar se ejecuta) y coyote time conservado.
- Teclas **1 a 7** para elegir arma directamente y **Enter** para jugar, reintentar o continuar.
- Varias teclas pueden controlar la misma acción sin interferirse, y las teclas se liberan al perder el foco o pausar.
- El ratón usa Pointer Events filtrados por tipo de puntero (se corrige el disparo bloqueado). La detección táctil usa el puntero principal, y si se toca la pantalla en un equipo detectado como no táctil, los controles táctiles se activan al momento.
- Se corrigió el `slideHold` sin inicializar. Los consejos de tutorial ya no aparecen durante un jefe. El anuncio de «25 jefes» ya no puede salir después de perder.
- **Mecánicas sin cambios**: velocidades, daños, alturas de salto, ritmo de generación y jefes. Se valoró añadir un salto de altura variable y se descartó porque, con toques cortos en móvil, no permitía superar los coches.

### 3.5 Interfaz
- Pila central (barra de jefe, anuncio y consejo) con flexbox: **no hay solapamientos**, y una prueba automatizada lo verifica.
- Panel de controles en cuadrícula (teclado o táctil, según el dispositivo) en el menú y en la pausa.
- La derrota muestra el nivel y la zona alcanzados.
- Foco visible para teclado, animación de entrada en las pantallas y diseño adaptado a pantallas bajas con desplazamiento si no cabe.

### 3.6 Rendimiento
- Los degradados radiales se rasterizan **una sola vez** y se reutilizan como sprites (luces, brillos, fuego, llamas).
- Los lienzos auxiliares se agrupan por tamaño y se asignan por actor y fotograma. Esto evita que el navegador copie superficies completas al reutilizarlas: fue lo que más costaba en las mediciones.
- Las operaciones de composición globales (`copy`, `source-in`) se limitan con recorte a la caja de cada personaje.
- **Calidad adaptativa**: si el equipo no sostiene unos 45 FPS, el juego baja de nivel automáticamente: 2 = completo, 1 = solo contorno, 0 = dibujo directo y sin capas secundarias. Se puede fijar con `?q=0`, `?q=1` o `?q=2`.
- El redimensionado espera 120 ms antes de reconstruir las capas, y la resolución interna se limita a 2×.

---

## 4. Evaluación posterior (1 a 10)

| Área | Antes | Después | Comentario |
|---|:-:|:-:|---|
| Calidad visual | 4 | 7 | Hay contraste, separación de planos y cuatro paletas |
| Diseño de personajes | 3 | 7 | Protagonista y zombis rediseñados con volumen y silueta. Los jefes solo mejoran por el compositor (ver pendientes) |
| Escenarios | 5 | 7 | Perspectiva atmosférica, primer plano, escala coherente y variedad por zona |
| Animaciones | 5 | 6 | Poses de salto, aterrizaje, bufanda, cojera y mandíbula. El ciclo base es el original |
| Jugabilidad | 6 | 7 | Mismo diseño con fallos corregidos |
| Controles | 5 | 8 | Búfer de salto, teclas robustas, ratón corregido, 1 a 7 y Enter |
| Física y colisiones | 6 | 7 | Colisiones escaladas de forma coherente y error del deslizamiento corregido |
| Interfaz | 5 | 7 | Sin solapamientos y con un panel de controles claro |
| Experiencia de usuario | 5 | 7 | Progresión visual, tutorial que no estorba y navegación con teclado |
| Rendimiento | 5 | 6 | Efectos más baratos y calidad adaptativa. Los personajes cuestan más con calidad máxima (ver §5) |
| Calidad técnica | 3 | 7 | Código modular y comentado, compilación a un solo archivo y pruebas automatizadas |

---

## 5. Pruebas realizadas

**Automatizadas** (`node tests/gameplay.test.js`): **46 de 46 correctas**, tanto sobre `game/index.html` como sobre `dist/zona_muerta.html`. Cubren:
- menú, inicio con Enter y HUD;
- salto, doble salto y búfer de salto;
- deslizamiento bajo una viga sin daño, y daño si se está de pie;
- disparo, consumo de munición y recarga;
- selección de arma con 1 a 7 y con Q;
- teclas superpuestas;
- clic del ratón;
- pausa: congela el juego, muestra los controles y Esc reanuda;
- cambio de nivel y de zona, y fin del fundido;
- aparición del jefe y ausencia de solapes en la interfaz; derrota del jefe y arma soltada;
- derrota, nivel y zona en la pantalla final, récord en `localStorage`, reinicio limpio y Salir al menú;
- redimensionado;
- móvil (Pixel 7 en horizontal): controles visibles, FUEGO al pulsar y soltar, tamaño táctil;
- calidad adaptativa;
- ausencia total de errores de JavaScript.

**Visuales** (capturas en `docs/capturas/`): menú, partida, jefe, derrota y móvil, antes y después. También una galería con los 6 zombis y los 6 cuerpos de jefe con el arma levantada, para comprobar que nada queda recortado.

**Rendimiento medido** (Chromium sin GPU, renderizado por software; es el peor caso, no representativo de un equipo con GPU):

| Escena | Original | Nueva con `q=2` | Nueva con `q=1` | Nueva con `q=0` |
|---|:-:|:-:|:-:|:-:|
| Lanzallamas, explosiones y zombis continuos | 21 FPS | 12 | 13 | 20 |

Sin GPU, la calidad máxima cuesta el doble que el original, y por eso existe la calidad adaptativa: un equipo lento baja de nivel solo en pocos segundos y queda al nivel del original. En navegadores con GPU (la gran mayoría hoy, también en móvil), las copias entre lienzos que añade el compositor son operaciones baratas. **No se pudo medir en dispositivos físicos.**

**No verificable en este entorno:**
- El **sonido** a oído. El código de audio no se modificó y no hay errores de Web Audio.
- La vibración y el bloqueo de orientación en móviles reales.
- Safari en iOS real (sí se emuló el viewport).

---

## 6. Pendientes recomendados

1. **Arte de los jefes**: sus formas siguen siendo las originales (formas planas). Son 6 cuerpos y 25 variantes; rediseñarlos con el mismo nivel que el protagonista es el siguiente paso de más impacto visual.
2. **Animaciones de muerte** específicas por tipo de zombi. Ahora todos usan la caída hacia atrás original.
3. **Prueba en dispositivos reales**: un Android de gama baja y un iPhone, para ajustar el umbral de la calidad adaptativa.
4. Opción de **volumen separado** para música y efectos. Hoy el original tiene un único interruptor de sonido.
5. Las fuentes dependen de Google Fonts. Sin conexión se usan fuentes del sistema y la estética pierde algo. Se pueden incrustar si el cliente lo quiere totalmente sin conexión.
