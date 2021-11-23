<?php

class Request
{

  public function post(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_input(INPUT_POST, $param, $filtre);
  }

  public function get(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_input(INPUT_GET, $param, $filtre);
  }

  public function env(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_input(INPUT_ENV, $param, $filtre);
  }

  public function server(string $param, int $filtre = FILTER_DEFAULT)
  {
    return filter_input(INPUT_SERVER, $param, $filtre);
  }

  public function method()
  {
    return $this->server('REQUEST_METHOD');
  }
}
