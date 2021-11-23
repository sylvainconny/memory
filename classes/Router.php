<?php

/**
 * La classe Router permet d'agréger les différentes pages
 * du site
 */

class Router
{
  private $routes = [];

  /**
   * Ajouter une route (page)
   */
  public function ajouterRoute($route, callable $fonction)
  {
    $this->routes[$route] = $fonction;
  }

  /**
   * Démarrer le router
   */
  public function demarrer(Request $request, Response $response)
  {
    // récupérer la route soit ce qui vient après http://localhost:8000
    $route = $request->route();
    // si la route existe, l'exécuter
    if (array_key_exists($route, $this->routes)) {
      $this->routes[$route]($request, $response);
    }
    // sinon afficher une page 404
    else {
      $response->notFound();
    }
  }
}
