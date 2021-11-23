<?php

use Twig\Environment;

class Response
{

  private $twig;

  public function __construct(Environment $twig)
  {
    $this->twig = $twig;
  }

  public function notFound(bool $exit = true)
  {
    header('HTTP/1.0 404 Not Found');
    echo $this->twig->render('404.html.twig', ['title' => '404: Page inexistante']);
    if ($exit) exit;
  }

  public function notAllowed(bool $exit = true)
  {
    header('HTTP/1.0 405 Method Not Allowed');
    if ($exit) exit;
  }

  public function badRequest(bool $exit = true)
  {
    header('HTTP/1.0 400 Bad Request');
    if ($exit) exit;
  }

  public function success(bool $exit = true)
  {
    header("HTTP/1.1 200 OK");
    if ($exit) exit;
  }

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

  public function template(string $tpl, array $params = [], bool $exit = true)
  {
    echo $this->twig->render($tpl, $params);
    if ($exit) exit;
  }

  public function json(mixed $data, bool $exit = true)
  {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    if ($exit) exit;
  }
}
