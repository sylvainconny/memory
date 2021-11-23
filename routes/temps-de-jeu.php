<?php

require_once __CLASSES__ . '/TempsDeJeu.php';
require_once __CLASSES__ . '/Response.php';
require_once __CLASSES__ . '/Request.php';

/**
 * Instanciations des objets de la page
 */
$tempsDeJeu = new TempsDeJeu($pdo);
$response = new Response();
$request = new Request();

/**
 * Essaie d'exécuter la réponse
 */
try {
  switch ($request->method()) {
    case 'GET':
      // Renvoie au format JSON la liste des temps de jeu
      $response->json(
        $tempsDeJeu->lister()
      );
      break;
    case 'POST':
      // Valeur envoyée avec la requête
      $temps_realise = $request->post('temps_realise', FILTER_VALIDATE_INT);
      // SI la valeur temps_realise est supérieur à zero
      if ($temps_realise > 0) {
        // ajouter le temps de jeu
        $tempsDeJeu->ajouter($temps_realise);
        // renvoyer une réponse de succès
        $response->success();
      }
      // SI la valeur temps_realise n'est supérieur à zero
      else {
        $response->badRequest();
      }
      break;
    default:
      // methode non autorisée
      $response->notAllowed();
  }
}
/**
 * En cas d'échec, renvoyer l'erreur
 */
catch (Throwable $err) {
  $response->error($err);
}
