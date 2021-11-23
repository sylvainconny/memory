<?php



class Router
{
  private $routes = [];

  public function ajouterRoute($route, callable $fonction)
  {
    $this->routes[$route] = $fonction;
  }

  public function demarrer(Request $request, Response $response)
  {
    $route = $request->route();
    if (array_key_exists($route, $this->routes)) {
      $this->routes[$route]($request, $response);
    } else {
      $response->notFound();
    }
  }
}
