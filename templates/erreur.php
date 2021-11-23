<?php

/**
 * Page d'erreur
 */
// si l'erreur existe
if (isset($err) and !empty($err)) {
  // afficher l'erreur
  $message_erreur = $err->getMessage();
  $code_erreur = $err->getCode();
} else {
  $message_erreur = "Pas d'erreur";
  $code_erreur = 0;
}

$head_title = "Erreur {$code_erreur}";

?>

<!DOCTYPE html>
<html lang="fr">
<?php include __TEMPLATES__ . '/head.php'; ?>

<body>
  <section class="d-flex min-vh-100 justify-content-center align-items-center">
    <div class="alert alert-danger">
      <h1><?= $head_title ?></h1>
      <?= $message_erreur ?>
    </div>
  </section>
</body>

</html>

<?php
/**
 * Clôture la page
 */
exit;
?>
