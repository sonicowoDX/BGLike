# 🎲 BGLike

**¿Qué jugamos hoy?**

BGLike es una herramienta web para compartir una colección de juegos de mesa con amigos, registrar las preferencias de cada jugador y ayudar al grupo a decidir qué jugar.

El proyecto nació de una pregunta bastante común en nuestro grupo:

> Tenemos muchos juegos... pero ¿qué jugamos hoy?

BGLike utiliza las preferencias de los jugadores, los datos de la colección y distintos filtros para ayudar a reducir las opciones y encontrar juegos que encajen mejor con el grupo.

---

## 🚀 Probar BGLike

Puedes utilizar BGLike directamente desde tu navegador:

### 🎲 [Abrir BGLike](https://sonicowodx.github.io/BGLike/index.html)

No necesitas crear una cuenta.

---

## 📖 ¿Cómo funciona?

### 1. Crea una colección

Exporta tu colección desde BoardGameGeek en formato CSV e impórtala en BGLike.

Al crearla, BGLike generará automáticamente un código con el formato:

`XXXX-XXXX-XXXX-XXXX`

Guarda este código, ya que permite volver a acceder a la colección, actualizarla y compartirla con tus amigos.

### 2. Comparte el código

Tus amigos pueden unirse utilizando el código de la colección.

Cada persona puede registrar su preferencia para cada juego mediante cinco reacciones:

| Reacción | Significado |
|---|---|
| 💀 | Lo odio |
| 👎 | No me gusta |
| ❔ | No lo he jugado |
| 👍 | Me gusta |
| ⭐ | Favorito |

### 3. Elige quién está jugando

Antes de decidir qué jugar, puedes seleccionar los jugadores presentes.

Los scores y herramientas de recomendación se recalculan utilizando únicamente las preferencias de esas personas.

### 4. Encuentra qué jugar

Utiliza los filtros, scores y herramientas de BGLike para reducir la colección hasta encontrar algo que funcione para todo el grupo.

---

## ✨ Características

Actualmente BGLike incluye:

- 📁 Importación y actualización de colecciones mediante CSV de BoardGameGeek.
- 🔗 Colecciones compartidas mediante código.
- 👥 Múltiples jugadores por colección.
- 💀 👎 ❔ 👍 ⭐ Sistema de preferencias individuales.
- 📊 Score grupal calculado según los jugadores presentes.
- 🎲 **Feeling Lucky** para elegir automáticamente entre las mejores opciones.
- 🔄 **Girar de nuevo** sin repetir los juegos que ya aparecieron durante la ronda.
- 🎯 **Match del grupo** para encontrar juegos compatibles con las preferencias de los jugadores.
- 🔥 Filtros rápidos para encontrar juegos relevantes.
- 👥 Filtro independiente por cantidad de jugadores.
- ⚖️ Filtro por peso.
- ⏱️ Filtro por duración.
- 📊 Filtro por score mínimo.
- 🎲 Filtro entre juegos standalone y expansiones.
- 🔎 Búsqueda de juegos.
- ↕️ Ordenamiento por nombre, rating, peso y score.
- 💬 Consulta de quién reaccionó y cómo a cada juego.
- 🖼️ Posibilidad de agregar manualmente portadas faltantes.
- 🔗 Acceso directo desde cada juego a su página de BoardGameGeek.
- 📤 Enlace para compartir directamente una colección.

---

## 🎲 Feeling Lucky

Cuando el grupo simplemente no logra decidirse, **Feeling Lucky** puede hacerlo por ustedes.

BGLike toma los juegos disponibles después de aplicar los filtros actuales y utiliza el score del grupo para seleccionar entre las mejores opciones.

La selección considera inicialmente los mejores candidatos y, cuando el score límite es positivo, también incluye los juegos empatados con el último candidato.

Si el resultado no convence al grupo, puedes utilizar **Girar de nuevo**.

Los juegos que ya hayan aparecido se eliminan de los candidatos de esa ronda para garantizar que el siguiente resultado sea diferente.

Al cerrar Feeling Lucky e iniciarlo nuevamente, los candidatos se recalculan utilizando los filtros y jugadores seleccionados en ese momento.

---

## 🔥 Filtros rápidos

Además de los filtros tradicionales, BGLike incluye accesos rápidos para situaciones comunes.

Por ejemplo, puedes buscar juegos:

- Con mejores puntuaciones.
- Marcados como favoritos.
- Que algunos jugadores todavía no han jugado.
- Compatibles con todo el grupo.
- Con opiniones divididas entre los jugadores.

Los filtros rápidos pueden combinarse con el resto de los criterios de búsqueda.

---

## 🌎 Idiomas

Actualmente BGLike está disponible en **español**.

Elegí comenzar desarrollándolo en mi propio idioma, pero está planeado agregar soporte para más idiomas en el futuro.

---

## 🛠️ Tecnologías

BGLike está desarrollado principalmente con:

- HTML
- CSS
- JavaScript
- Supabase
- GitHub Pages

El proyecto funciona directamente desde el navegador y no requiere instalación.

---

## 🧪 Estado del proyecto

BGLike continúa en desarrollo.

La herramienta ya puede utilizarse normalmente, pero seguirán agregándose funciones, mejoras de interfaz y ajustes conforme se pruebe con más colecciones y grupos de jugadores.

Si encuentras algún error o tienes una idea que pueda mejorar BGLike, puedes abrir un **Issue** en este repositorio.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas.

Si quieres proponer una mejora, corregir un error o trabajar en una nueva función:

1. Haz un fork del repositorio.
2. Crea una rama para tus cambios.
3. Realiza tus modificaciones.
4. Haz commit de los cambios.
5. Abre un Pull Request explicando qué modificaste.

También puedes utilizar los Issues para proponer funciones o reportar problemas antes de comenzar a trabajar en ellos.

---

## ☕ Apoya BGLike

BGLike es un proyecto independiente desarrollado y mantenido en mi tiempo libre.

Si te resulta útil y quieres apoyar su desarrollo, mantenimiento y futuras mejoras, puedes hacer una donación mediante PayPal.

[![Donar con PayPal](https://img.shields.io/badge/PayPal-Apoyar%20BGLike-blue?logo=paypal)](https://paypal.me/davidolivettopalomin)

Cualquier apoyo es completamente opcional y muy apreciado. ❤️

---

## 📄 Licencia

BGLike está distribuido bajo la licencia **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Puedes estudiar, modificar y redistribuir el código bajo los términos de esta licencia.

Las versiones modificadas que se ofrezcan a usuarios a través de una red deben proporcionar acceso al código fuente correspondiente conforme a los términos de la AGPLv3.

Consulta el archivo [LICENSE](LICENSE) para conocer los términos completos.

Copyright © 2026 David Olivetto Palomino.

---

## ™️ Nombre e identidad visual

La licencia AGPL-3.0 se aplica al código fuente de BGLike.

El nombre **BGLike**, sus logotipos y otros elementos de identidad visual del proyecto no se conceden bajo dicha licencia salvo indicación expresa.

---

## ❤️ Agradecimientos

Gracias a todas las personas que han probado BGLike, compartido sus colecciones y ayudado a encontrar errores o proponer nuevas ideas.

Y, por supuesto, gracias a la comunidad de **BoardGameGeek**, cuyos datos exportados por los propios usuarios hacen posible utilizar sus colecciones dentro de BGLike.

---

**BGLike — ¿Qué jugamos hoy? 🎲**
