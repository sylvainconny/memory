<?php

class Response
{
  public function notFound(bool $exit = true)
  {
    header('HTTP/1.0 404 Not Found');
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

  public function error(Throwable $err, bool $exit = true)
  {
    header('HTTP/1.0 500 Internal Server Error');
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
      'erreur' => $err->getMessage()
    ]);
    if ($exit) exit;
  }

  public function success(bool $exit = true)
  {
    header("HTTP/1.1 200 OK");
    if ($exit) exit;
  }

  public function json(mixed $data, bool $exit = true)
  {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    if ($exit) exit;
  }
}
