<?php

require_once __CLASSES__ . '/TempsDeJeu.php';

$router->ajouterRoute('/temps-de-jeu', function (Request $req, Response $res) use ($pdo) {
  /**
   * Instanciations des objets de la page
   */
  $tempsDeJeu = new TempsDeJeu($pdo);

  /**
   * Essaie d'exécuter la réponse
   */
  try {
    switch ($req->method()) {
      case 'GET':
        // Renvoie au format JSON la liste des temps de jeu
        $res->json(
          $tempsDeJeu->lister()
        );
        break;
      case 'POST':
        // Valeur envoyée avec la requête
        $temps_realise = $req->post('temps_realise', FILTER_VALIDATE_INT);
        // SI la valeur temps_realise est supérieur à zero
        if ($temps_realise > 0) {
          // ajouter le temps de jeu
          $tempsDeJeu->ajouter($temps_realise);
          // renvoyer une réponse de succès
          $res->success();
        }
        // SI la valeur temps_realise n'est supérieur à zero
        else {
          $res->badRequest();
        }
        break;
      default:
        // methode non autorisée
        $res->notAllowed();
    }
  }
  /**
   * En cas d'échec, renvoyer l'erreur
   */
  catch (Throwable $err) {
    $res->error($err);
  }
});
