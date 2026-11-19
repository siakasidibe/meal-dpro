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

  // Bouton « J'ai terminé cette section »
  document.querySelectorAll('[data-terminer]').forEach(function (btn) {
    var cle = 'fait-' + btn.getAttribute('data-terminer');
    var libelle = btn.getAttribute('data-libelle') || btn.textContent;
    function maj(fait) { btn.setAttribute('aria-pressed', fait ? 'true' : 'false'); btn.textContent = fait ? 'Terminé ✓' : libelle; }
    maj(lire(cle));
    btn.addEventListener('click', function () { var f = !lire(cle); ecrire(cle, f); maj(f); });
  });

  // Sommaire : afficher les étapes terminées
  document.querySelectorAll('[data-etat]').forEach(function (el) {
    if (lire('fait-' + el.getAttribute('data-etat'))) el.textContent = 'Terminé ✓';
  });
})();
