<?php

/**
 * On change le header pour indiquer au navigateur
 * qu'il s'agit d'une erreur 404, que la page
 * recherchée n'existe pas.
 */
header('HTTP/1.0 404 Not Found');

$head_title = '404: Page inexistante';
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <?php include __TEMPLATES__ . '/head.php'; ?>
</head>

<body>
  <section class="d-flex min-vh-100 justify-content-center align-items-center">
    <div>
      <h1 class="text-danger"><?= $head_title ?></h1>
      <p class="m-0">
        Retourner à la <a href="http://<?= SERVER_URL ?>">page d'accueil</a>
      </p>
    </div>
  </section>
</body>

</html>
