<?php

require_once('db-config.php');

if (isset($_GET['f']) && $_GET['f']=='submit_score') {

	//check if user already exists
	$user_query = "SELECT id FROM `users` WHERE `email` = '".$_POST['email']."'";
	$user_query_result = mysqli_query($dbh, $user_query);

	if (mysqli_num_rows($user_query_result) > 0) {
		//add score for the existing user
		$row = mysqli_fetch_assoc($user_query_result);

		$score_query = "INSERT INTO `scores`(`user_id`, score) VALUES ('".$row['id']."', '".$_POST['score']."')";
		$result = mysqli_query($dbh, $score_query);

		if ($result) {
			// send rating
			$rating_query = "SELECT user_id, score, FIND_IN_SET( score, ( SELECT GROUP_CONCAT( score ORDER BY score DESC ) FROM scores ) ) AS rank FROM scores WHERE user_id = ".$row['id'];
			$rating_query_result = mysqli_query($dbh, $rating_query);
			echo json_encode(mysqli_fetch_assoc($rating_query_result));

		} else {
			echo "error";

		}

	} else {
		// Create user and add score
		$create_user_query = "INSERT INTO `users`(`name`, `email`) VALUES ('".$_POST['name']."', '".$_POST['email']."')";
		$create_user_query_result = mysqli_query($dbh, $create_user_query);

		if ($create_user_query_result) {
			$user_id = mysqli_insert_id($dbh);
			$score_query = "INSERT INTO `scores`(`user_id`, `score`) VALUES ('".$user_id."', '".$_POST['score']."')";
			$result = mysqli_query($dbh, $score_query);

			if ($result) {
				// send rating
				$rating_query = "SELECT user_id, score, FIND_IN_SET( score, ( SELECT GROUP_CONCAT( score ORDER BY score DESC ) FROM scores ) ) AS rank FROM scores WHERE user_id = ".$user_id;
				$rating_query_result = mysqli_query($dbh, $rating_query);
				echo json_encode(mysqli_fetch_assoc($rating_query_result));

			} else {
				echo "error";

			}

		} else {
			echo "error";

		}
	}
	
}

if(isset($_GET['f']) && $_GET['f']=='top_scores') {
	$query = "SELECT users.name, scores.score FROM `scores` scores INNER JOIN `users` users ON users.id = scores.user_id ORDER BY `scores`.`score` DESC LIMIT 0, 3";
	$result = mysqli_query($dbh, $query);
	echo json_encode(mysqli_fetch_all($result, MYSQLI_ASSOC));
}