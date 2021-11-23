<?php

/**
 * Classe pour regrouper les informations des requêtes
 */

class Request
{

  /**
   * Récupérer un paramètre d'une requête POST
   */
  public function post(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_input(INPUT_POST, $param, $filtre);
  }

  /**
   * Récupérer un paramètre d'une requête GET
   */
  public function get(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_input(INPUT_GET, $param, $filtre);
  }

  /**
   * Récupérer un paramètre d'environnement
   */
  public function env(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_input(INPUT_ENV, $param, $filtre);
  }

  /**
   * Récupérer un paramètre serveur
   */
  public function server(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_input(INPUT_SERVER, $param, $filtre);
  }

  /**
   * Récupérer la méthode de la requête
   */
  public function method()
  {
    return $this->server('REQUEST_METHOD');
  }

  /**
   * Récupérer la route de la requête
   * soit ce qui va après http://localhost:8000
   */
  public function route()
  {
    return $this->server('REQUEST_URI');
  }
}
