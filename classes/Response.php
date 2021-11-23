<?php

use Twig\Environment;

/**
 * Classe permettant d'envoyer la réponse du serveur
 */

class Response
{

  private $twig;

  /**
   * twig: moteur de template
   */
  public function __construct(Environment $twig)
  {
    $this->twig = $twig;
  }

  /**
   * 404: page non trouvée
   */
  public function notFound(bool $exit = true)
  {
    header('HTTP/1.0 404 Not Found');
    echo $this->twig->render('404.html.twig', ['title' => '404: Page inexistante']);
    if ($exit) exit;
  }

  /**
   * 405: méthode non autorisée
   */
  public function notAllowed(bool $exit = true)
  {
    header('HTTP/1.0 405 Method Not Allowed');
    if ($exit) exit;
  }

  /**
   * 400: mauvaise requête
   */
  public function badRequest(bool $exit = true)
  {
    header('HTTP/1.0 400 Bad Request');
    if ($exit) exit;
  }

  /**
   * 200: succès
   */
  public function success(bool $exit = true)
  {
    header("HTTP/1.1 200 OK");
    if ($exit) exit;
  }

  /**
   * 500: erreur
   * renvoie une réponse en JSON ou en HTML
   */
  public function error(Throwable $err, bool $json = true, bool $exit = true)
  {
    header('HTTP/1.0 500 Internal Server Error');
    if ($json) {
      $this->json([
        'erreur' => $err->getMessage()
      ], $exit);
    } else {
      $code_erreur = $err->getCode();
      $this->template('erreur.html.twig', [
        'title' => "Erreur {$code_erreur}",
        'message_erreur' => $err->getMessage()
      ], $exit);
    }
  }

  /**
   * Renvoie du HTML généré par twig
   */
  public function template(string $tpl, array $params = [], bool $exit = true)
  {
    echo $this->twig->render($tpl, $params);
    if ($exit) exit;
  }

  /**
   * Renvoie les données au format JSON
   */
  public function json(mixed $data, bool $exit = true)
  {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    if ($exit) exit;
  }
}
