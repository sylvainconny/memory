<?php

/**
 * Classe visant à intéragir avec la table temps_de_jeu
 */
class TempsDeJeu
{

  private $pdo;

  /**
   * Récupère la connexion à la base de données
   */
  public function __construct(PDO $pdo)
  {
    $this->pdo = $pdo;
  }

  /**
   * Éxecute la création de la table temps_de_jeu
   */
  public function creerTable()
  {
    $this->pdo->exec("CREATE TABLE IF NOT EXISTS temps_de_jeu (
      id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
      temps_realise INT NOT NULL,
      date_partie TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
    ) CHARACTER SET utf8 COLLATE utf8_general_ci");
  }

  /**
   * Liste les temps de jeu de la table temps_de_jeu
   */
  public function lister()
  {
    $liste = $this->pdo->prepare('SELECT * FROM temps_de_jeu ORDER BY temps_realise ASC;');
    $liste->execute();
    return $liste->fetchAll(PDO::FETCH_OBJ);
  }

  /**
   * Ajoute un temps de jeu dans la table temps_de_jeu
   */
  public function ajouter(int $temps_realise)
  {
    /**
     * On peut se contenter de n'insérer que le temps_realise
     * car la colonne id s'auto-incrémente automatiquement
     * et la colonne date_partie insère
     * automatiquement la date de l'insertion
     */
    $insertion = $this->pdo->prepare('INSERT INTO temps_de_jeu (temps_realise) VALUES (?);');
    $insertion->execute([$temps_realise]);
  }
}
