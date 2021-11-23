<!DOCTYPE html>
<html lang="fr">
<?php
$head_title = $message_erreur;
include __TEMPLATES__ . '/head.php';
?>

<body>
  <p>
    <?= $code_erreur ?>:
    <?= $message_erreur ?>
  </p>
</body>

</html>
