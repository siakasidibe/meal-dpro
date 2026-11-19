// Quiz à une seule bonne réponse : correction immédiate, explication, score gardé sur l'appareil.
(function () {
  function lire(cle) { try { return JSON.parse(localStorage.getItem(cle)); } catch (e) { return null; } }
  function ecrire(cle, val) { try { localStorage.setItem(cle, JSON.stringify(val)); } catch (e) {} }

  document.querySelectorAll('[data-quiz]').forEach(function (quiz) {
    var id = quiz.getAttribute('data-quiz');
    var questions = quiz.querySelectorAll('.quiz-question');
    var scoreEl = quiz.querySelector('.score');
    var reponses = lire('quiz-' + id) || {};

    function majScore() {
      var faites = 0, justes = 0;
      questions.forEach(function (q, i) { if (reponses[i] !== undefined) { faites++; if (reponses[i]) justes++; } });
      if (scoreEl) scoreEl.textContent = faites ? 'Score : ' + justes + ' sur ' + questions.length + (faites < questions.length ? ' (' + (questions.length - faites) + ' question(s) restante(s))' : '') : '';
    }

    questions.forEach(function (q, i) {
      var bonne = q.getAttribute('data-bonne');
      var expl = q.querySelector('.explication');
      q.querySelectorAll('input[type=radio]').forEach(function (input) {
        input.addEventListener('change', function () {
          if (q.dataset.repondu) return;
          q.dataset.repondu = '1';
          var juste = input.value === bonne;
          q.querySelectorAll('.choix').forEach(function (c) {
            var v = c.querySelector('input').value;
            if (v === bonne) c.classList.add('juste');
            else if (v === input.value) c.classList.add('faux');
            c.querySelector('input').disabled = true;
          });
          expl.querySelector('.verdict').innerHTML = juste ? '<strong class="ok">Bonne réponse.</strong> ' : '<strong class="ko">Ce n\'est pas la bonne réponse.</strong> ';
          expl.hidden = false;
          reponses[i] = juste; ecrire('quiz-' + id, reponses); majScore();
        });
      });
    });

    var recommencer = quiz.querySelector('[data-recommencer]');
    if (recommencer) recommencer.addEventListener('click', function () {
      reponses = {}; ecrire('quiz-' + id, reponses);
      questions.forEach(function (q) {
        delete q.dataset.repondu;
        q.querySelector('.explication').hidden = true;
        q.querySelectorAll('.choix').forEach(function (c) { c.classList.remove('juste', 'faux'); var inp = c.querySelector('input'); inp.disabled = false; inp.checked = false; });
      });
      majScore();
    });
    majScore();
  });

  // Parcours imposé : les sections se suivent dans l'ordre (window.PARCOURS, généré par construire.py)
  var P = window.PARCOURS || [], R = window.RACINE || '';
  function fait(id) { return !!lire('fait-' + id); }
  function rang(id) { for (var k = 0; k < P.length; k++) if (P[k][0] === id) return k; return -1; }
  function premierManquant(i) { for (var k = 0; k < i; k++) if (!fait(P[k][0])) return P[k]; return null; }
  function hache(t) { var a = 5381; for (var k = 0; k < t.length; k++) a = ((a * 33) ^ t.charCodeAt(k)) >>> 0; return a; }
  function restantes() {
    var n = 0;
    document.querySelectorAll('[data-quiz]').forEach(function (q) {
      var r = lire('quiz-' + q.getAttribute('data-quiz')) || {};
      n += q.querySelectorAll('.quiz-question').length - Object.keys(r).length;
    });
    return n;
  }

  // Bouton « J'ai terminé » : enregistre la section puis ouvre la suivante
  document.querySelectorAll('[data-terminer]').forEach(function (btn) {
    var id = btn.getAttribute('data-terminer'), i = rang(id), suivante = i >= 0 ? (P[i + 1] ? R + P[i + 1][1] : R + 'index.html') : null;
    var msg = document.createElement('p'); msg.className = 'msg-terminer'; msg.setAttribute('role', 'status');
    btn.closest('nav').insertAdjacentElement('beforebegin', msg);
    function maj() { var f = fait(id); btn.setAttribute('aria-pressed', f ? 'true' : 'false'); if (f) btn.textContent = suivante ? 'Terminé ✓ · Continuer' : 'Terminé ✓'; }
    maj();
    btn.addEventListener('click', function () {
      var n = restantes();
      if (!fait(id) && n > 0) { msg.textContent = 'Répondez d\'abord à toutes les questions de la page : ' + n + ' question(s) restante(s).'; return; }
      ecrire('fait-' + id, true); maj();
      if (suivante) location.href = suivante;
    });
    // Section verrouillée tant que les précédentes ne sont pas terminées
    var manque = i > 0 && !fait(id) ? premierManquant(i) : null;
    if (manque) {
      var main = document.querySelector('main.contenu'), garder = main.querySelectorAll('.fil, h1');
      main.innerHTML = '';
      garder.forEach(function (el) { main.appendChild(el); });
      var boite = document.createElement('section'); boite.className = 'verrou';
      boite.innerHTML = '<h2>Section verrouillée</h2><p>Le cours se suit dans l\'ordre. Terminez d\'abord : <strong></strong>.</p>' +
        '<p><a class="bouton" href="' + R + manque[1] + '">Aller à cette section</a></p>' +
        '<details><summary>Code formateur</summary><form class="code"><label for="code">Le formateur peut débloquer cette section, par exemple sur un nouveau téléphone.</label>' +
        '<input id="code" type="password" autocomplete="off"><button type="submit" class="bouton secondaire">Débloquer</button></form></details>';
      boite.querySelector('strong').textContent = manque[2];
      main.appendChild(boite);
      boite.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        if (hache(boite.querySelector('input').value.trim().toUpperCase()) === 3176499030) { P.slice(0, i).forEach(function (p) { ecrire('fait-' + p[0], true); }); location.reload(); }
        else boite.querySelector('label').textContent = 'Code incorrect.';
      });
    }
  });

  // Sommaire : sections terminées, à faire ou verrouillées
  document.querySelectorAll('[data-etat]').forEach(function (el) {
    var id = el.getAttribute('data-etat'), i = rang(id), lien = el.parentNode.querySelector('a');
    if (fait(id)) el.textContent = 'Terminé ✓';
    else if (i > 0 && premierManquant(i)) {
      el.textContent = 'Verrouillé';
      if (lien) { lien.classList.add('verrouille'); lien.setAttribute('aria-disabled', 'true'); lien.addEventListener('click', function (e) { e.preventDefault(); }); }
    } else if (i >= 0) el.textContent = 'À faire';
  });
})();
