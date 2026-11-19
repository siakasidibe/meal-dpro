// Vérifie un numéro de certificat dans assets/certificats.json (rempli par outils/certificats.py).
(function () {
  var f = document.getElementById('verif'), champ = document.getElementById('numero'), sortie = document.getElementById('resultat');
  function afficher(classe, html) { sortie.className = 'verif-resultat ' + classe; sortie.innerHTML = html; }
  function echapper(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function verifier(n) {
    n = n.trim().toUpperCase();
    if (!n) return;
    afficher('', 'Vérification en cours…');
    fetch('assets/certificats.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (liste) {
      var c = liste.filter(function (x) { return x.n.toUpperCase() === n; })[0];
      if (c) afficher('ok', '<strong>Certificat valide.</strong><br>N° ' + echapper(c.n) + ' délivré à <strong>' + echapper(c.nom) +
        '</strong> le ' + echapper(c.date) + ', pour la formation « Le MEAL en pratique » suivie ' + echapper(c.periode) + '.');
      else afficher('non', '<strong>Numéro introuvable.</strong><br>Vérifiez la saisie. Si le problème persiste, contactez le cabinet M.C Consulting Mopti.');
    }).catch(function () { afficher('non', 'La vérification demande une connexion internet. Réessayez plus tard.'); });
  }
  f.addEventListener('submit', function (e) { e.preventDefault(); verifier(champ.value); });
  var n = new URLSearchParams(location.search).get('n');
  if (n) { champ.value = n; verifier(n); }
})();
