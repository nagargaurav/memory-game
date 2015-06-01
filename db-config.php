<?php

/*Please change these credentials*/

$db_host = 'localhost';
$db_user = 'root';
$db_password = '';
$db_name = 'memory_game';

$dbh = mysqli_connect($db_host, $db_user, $db_password, $db_name);

// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  echo "<br/>";
  echo "Please check credentials in db-config.php";
  die();
}