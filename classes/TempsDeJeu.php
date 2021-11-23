<?php

/**
 * Classe visant à intéragir avec la table temps_de_jeu
 */
class TempsDeJeu
{

  private $pdo;

  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
  }

  public function creerTable()
  {
    $this->pdo->exec("CREATE TABLE IF NOT EXISTS temps_de_jeu (
      id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      temps_realise INT NOT NULL,
      date_partie TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
    ) CHARACTER SET utf8 COLLATE utf8_general_ci");
  }

  public function lister()
  {
    $liste = $this->pdo->prepare('SELECT * FROM temps_de_jeu ORDER BY temps_realise DESC;');
    $liste->execute();
    return $liste->fetchAll(PDO::FETCH_COLUMN);
  }

  public function ajouter(int $temps_realise)
  {
    $insertion = $this->pdo->prepare('INSERT INTO temps_de_jeu (temps_realise) VALUES (?);');
    $insertion->execute([$temps_realise]);
  }
}
