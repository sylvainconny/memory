<?php

/**
 * Indique que le contenu sera du json
 */
header('Content-Type: application/json; charset=utf-8');

/**
 * Les données qui seront renvoyées au format json
 */
$data = [
  'erreur' => '',
  'temps_realise' => []
];

/**
 * Méthode utilisée pour appeler le serveur
 */
$methode = filter_input(INPUT_SERVER, 'REQUEST_METHOD');

/**
 * Valeur envoyée avec la requête
 */
$temps_realise = filter_input(INPUT_POST, 'temps_realise', FILTER_VALIDATE_INT);

/**
 * SI la méthode n'est pas POST
 */
if ($methode !== 'POST') {
  header('HTTP/1.0 405 Method Not Allowed');
}
/**
 * SI la méthode est POST
 * ET la valeur temps_realise est supérieur à zero
 */
else if ($temps_realise > 0) {
  /**
   * Essaie d'insérer dans la table temps_de_jeu la valeur temps_realise
   */
  try {
    $insertion = $pdo->prepare('INSERT INTO temps_de_jeu (temps_realise) VALUES (?);');
    $insertion->execute([$temps_realise]);
  }
  /**
   * En cas d'échec, afficher l'erreur
   */
  catch (Throwable $err) {
    $data['erreur'] = $err->getMessage();
  }
}
/**
 * SI la méthode est POST
 * MAIS la valeur temps_realise n'est supérieur à zero
 */
else {
  header('HTTP/1.0 400 Bad Request');
}

echo json_encode($data);
