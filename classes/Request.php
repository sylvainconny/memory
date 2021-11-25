<?php

/**
 * Classe pour regrouper les informations des requêtes
 */

class Request
{

  private $body = [];

  /**
   * Récupérer un paramètre d'une requête POST
   */
  public function post(string $param, int $filtre = FILTER_DEFAULT)
  {
    if (!count($this->body)) {
      try {
        $this->body = json_decode(file_get_contents('php://input'), true);
      } catch (Throwable $_) {
        return null;
      }
    }
    if (!count($this->body)) return null;
    if (!array_key_exists($param, $this->body)) return null;
    return filter_var($this->body[$param], $filtre);
  }

  /**
   * Récupérer un paramètre d'une requête GET
   */
  public function get(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_var($_GET[$param], $filtre);
  }

  /**
   * Récupérer un paramètre serveur
   */
  public function server(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_var($_SERVER[$param], $filtre);
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
