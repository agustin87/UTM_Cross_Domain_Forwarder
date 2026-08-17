# UTM Cross-Domain Forwarder

Script pequeño (vanilla JS, sin dependencias) para un problema concreto: **tus campañas aterrizan en una landing que no vive en tu dominio final**, y los links de esa landing hacia tu web se comen los UTM por el camino.

Pensado para inyectarse vía GTM (o `<script>` directo) en la landing de terceros.

![Flujo del script](diagram.svg)

## El problema

Escenario típico: montas una campaña de Ads que apunta a `landing-de-agencia.com/promo?utm_source=meta&utm_campaign=verano`. Esa landing tiene un botón "Ver más" que enlaza a `example.com` — tu dominio real. Si ese link es un `href` estático, los UTM que trajo el usuario se pierden en el salto. Tu Analytics en `example.com` ve tráfico "direct / none" y toda la campaña queda sin atribuir.

## Qué hace el script

1. Lee los UTM presentes en la URL actual de la landing.
2. Si hay alguno, recorre todos los `<a>` de la página.
3. Para los links que apuntan a tu dominio final (`targetDomain`), reescribe el `href` añadiendo (o sobreescribiendo) esos UTM.

Nada más. No persiste nada, no hace fetch a ningún sitio, no lee ni escribe cookies.

## Decisiones de diseño (y por qué)

**Cookieless a propósito.** El script solo lee `window.location.search` en el momento y reescribe el DOM — no usa `sessionStorage`, `localStorage` ni cookies. Consecuencia: funciona exactamente igual acepte o rechace el usuario el banner de consentimiento, porque no hay nada que consentir (no se accede a almacenamiento del dispositivo bajo el Art. 5.3 ePrivacy). El trade-off es explícito: **solo cubre una página**. Si la landing tiene 2-3 páginas antes del link final, los UTM que solo venían en la URL de la página 1 no llegan a la página 2. Si necesitas cubrir ese caso, la solución pasa por `sessionStorage` — pero ahí entras en zona de necesitar consentimiento si el CMP bloquea Web Storage además de cookies.

**Match de dominio por `hostname`, no por substring.** La versión original de la que partí (la encontré circulando por internet, sin autoría clara — si la reconoces, avísame y añado crédito) comparaba con `href.indexOf(domain) > -1`. Eso matchea cualquier URL que *contenga* la cadena del dominio en cualquier parte — un query param, un dominio parecido (`evil-example.com`), lo que sea. Aquí se compara `url.hostname` de forma exacta.

**Sobreescribe UTM existentes, no los ignora.** La versión original solo decoraba el link si *no tenía ningún parámetro UTM ya puesto* — si tenía uno solo, se saltaba la decoración entera, aunque el comentario del propio código decía "add or replace". Aquí siempre usa `.set()`, así que el UTM real de la sesión gana siempre.

## Cómo usarlo

1. Cambia `targetDomain` por tu dominio real.
2. Ajusta `paramsToForward` si usas parámetros custom además de (o en vez de) los `utm_*` estándar.
3. Pega el script en la landing — vía GTM (tag de HTML personalizado, trigger "All Pages" o "Page View") o directamente antes del `</body>`.

## Limitaciones conocidas

- Cubre una sola página. No sirve si el usuario navega por varias páginas de la landing de terceros antes de llegar al link final.
- No decora links generados dinámicamente después de la ejecución del script (por ejemplo, insertados por otro script async posterior). Si tu landing carga contenido async, hay que re-ejecutar el forwarder tras esa carga o usar un `MutationObserver`.
- No toca `<form>` ni redirects hechos por JS (`window.location = ...`) — solo atributos `href` de `<a>`.

## Origen

El punto de partida es un script de decoración de UTM que circula por varios repos y blogs de analytics, sin autoría clara. Lo revisé, encontré un par de bugs (arriba explicados) y lo adapté a un caso de uso específico (landing de terceros, cookieless). Lo comparto tal cual está — probablemente no cubre tu caso exacto, pero puede ahorrarte el punto de partida. Tómalo, mejóralo o descártalo.

## Licencia

MIT. Úsalo sin pedir permiso.
