<script>
(function() {
  // === CONFIG ===
  // Dominio final al que apuntan los links que quieres decorar dentro de la landing.
  var targetDomain = 'example.com';

  // Parámetros que quieres reinsertar si llegan en la URL de la landing.
  var paramsToForward = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term'
  ];

  // Lee los UTMs presentes en la URL actual de la landing (la que los trajo desde la fuente externa)
  var incomingParams = new URLSearchParams(window.location.search);
  var utmsToForward = {};
  paramsToForward.forEach(function(param) {
    var value = incomingParams.get(param);
    if (value) utmsToForward[param] = value;
  });

  // Si no hay ningún UTM en la URL actual, no hay nada que reinsertar
  if (Object.keys(utmsToForward).length === 0) return;

  var links = document.querySelectorAll('a[href]');

  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var href = link.getAttribute('href');
    if (!href) continue;

    var url;
    try {
      url = new URL(href, window.location.origin);
    } catch (e) {
      continue; // href malformado (mailto:, tel:, javascript:, etc.) — se ignora
    }

    // Match exacto por hostname, no por substring de la URL completa
    if (url.hostname !== targetDomain && url.hostname !== 'www.' + targetDomain) continue;

    // Reinserta/sobreescribe cada UTM disponible, sin condicionar a que ya existan otros
    Object.keys(utmsToForward).forEach(function(param) {
      url.searchParams.set(param, utmsToForward[param]);
    });

    link.setAttribute('href', url.toString());
  }
})();
</script>
