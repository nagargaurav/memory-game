$(document).ready(function() {

	var gameBoard = $('.game-board');
	var scoreBoard = $('.score-board');
	var topScores = $('.top-scores');
	var colorBlocks = ['color1','color2','color3','color4','color5','color6','color7','color8','color1','color2','color3','color4','color5','color6','color7','color8'];
	var firstChoice, secondChoice, openGrids, doneGrids, currentScore, disable, firstKeyPress;

	$('body').on('submit', '#success_form', function(e){
		e.preventDefault();
		formData = $(this).serializeArray();
		var name = formData[0].value;
		var email = formData[1].value;
		var emailRe = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		var nameRe = /^[\w-]+[\s]*[\w-]*$/i;

		if(!nameRe.test(name)) {
			$('.error').html('Please enter a valid name');
		} else if(!emailRe.test(email)) {
			$('.error').html('Please enter a valid email address');
		} else {
			$.ajax ({
				url: 'functions.php?f=submit_score&ajax=true',
				type: 'POST',
				data: {name: name, email: email, score: currentScore},
				success: function(data) {
					if(data == 'error') {
						$('.error').html('Unable to perform the operation, please try again later.');	
					} else {
						rank = JSON.parse(data);
						var success_html = '<h2 style="text-align: center;">Thank you for subbmitting your score</h2><p style="text-align: center;"><span style="font-size:14px;">Your ranking is: <strong>'+ rank['rank'] +'</strong></span></p><p align="center"><input name="play" type="button" onclick="location.reload()" value="Play Again" /></p>';
						$('#success_form').remove();
						$('.success_box').html(success_html);
					}
				}
			})
		}
	});

	function play() {

		$('.grid').hover(function() {
			$('.grid').removeClass('focus');
			$(this).addClass('focus');
		});

		$('#restart').click(function(){
			InitBoard();
		});

		if(firstKeyPress){
			
			$('.grid:first').addClass('focus');
			$(document).keydown(function(e){
				keyPress(e);
			});

			firstKeyPress = false;
		}

		
		$('.grid').click(function(){

			if(disable) {
				return;
			}

			if(!$(this).hasClass('done') && !$(this).hasClass('open')) {
				openGrids++; 
				var color = $(this).attr('id');
				$(this).addClass('open');
				$(this).removeClass('card_bg').removeClass('flip-cover').addClass('flip-color');

				if (openGrids == 1) {
					firstChoice = color;

				} else {
					secondChoice = color;

					if(firstChoice === secondChoice){
						disable = true;
						setTimeout(function() {
							$('.'+secondChoice).addClass('done').removeClass('open');
							$('.'+firstChoice).addClass('done').removeClass('open');
							disable = false;
						}, 500);
						doneGrids += 2;
						openGrids = 0;
						currentScore++;
						updateScore(scoreBoard, currentScore);
						
					} else {
						openGrids = 0;
						currentScore--;
						updateScore(scoreBoard, currentScore);
						disable = true;

						setTimeout(function() {
							$('.open').removeClass('flip-color').addClass('flip-cover').addClass('card_bg');
							$('.open').removeClass('open');
							disable = false;
						}, 500);

					}

					if(doneGrids === 16){
						var form_boxy = new Boxy("<div class='success_box'><h2>Congratulations, you have won!!</h2><p>Your Score is "+ currentScore +".</p><p>To submit your score and to see your ranking, please submit the form below.</p><p class='error'></p></div><form action='' method='POST' id='success_form' ><div class='control-group'><label class='control-label' for='name'>Name</label><div class='controls'><input id='name' name='name' type='text' placeholder='Enter Your Name' class='input-xlarge' required=''></div></div><div class='control-group'><label class='control-label' for='email'>Email</label><div class='controls'><input id='email' name='email' type='text' placeholder='Enter Your Email' class='input-xlarge' required=''></div></div><div class='control-group'><div class='controls'><input id='submit' name='submit' type='submit' value='Submit'></div></div></form>",
						{	draggable: false,
							closeable: false,
							fixed: true,
							modal:true,
							title: 'Congrats, You won!!',
							unloadOnHide: true
						});
					}
				}
			}

		});

	}

	function getTopScores() {
		 $.get("functions.php?f=top_scores", function(data, status){
		 	var scores_html = '<p class="top-head">Top Scores</p><table align="center" border="1" cellspacing="0" style="width: 90%; border-color:#dddddd;">';
	        if(status == 'success') {
	        	var scores = JSON.parse(data);
	        	if(scores.length > 0) {
	        		scores_html += '<thead><tr><th scope="col">Name</th><th scope="col">Score</th></tr></thead><tbody>';
	        		for(var i = 0; i < scores.length; i++) {
						scores_html += '<tr><td>'+ scores[i].name +'</td><td>'+ scores[i].score +'</td></tr>';
					}
	        	} else {
	        		scores_html += '<tbody>';
	        		scores_html += '<tr align="center"><td>No Highscore yet.</td></tr>';
	        	}
	        	
				scores_html += '</tbody></table>';
				topScores.append(scores_html);
	        }
	    });
	}


	function InitBoard() {

		//Initialize variables
		openGrids = 0;
		doneGrids = 0;
		currentScore = 0;
		disable = false;
		firstKeyPress = true;
		firstChoice = '';
		secondChoice = '';

		// Shuffle the color blocks so we can araange them randomly
		randomBlocks = shuffle(colorBlocks);

		//update the top scores table
		getTopScores();

		//Remove any HTML from the game board container
		gameBoard.html('');

		//Insert the shuffled blocks in the HTML game-board container 
		for(var i = 0; i < randomBlocks.length; i++) {
			gameBoard.append('<div id="' + randomBlocks[i] + '" class="grid flip ' + randomBlocks[i] + '"></div>');
		}
		// Init the game info area to show the 2 sec message
		scoreBoard.html('<span class="peek-time">2 Seconds remaining</span>');

		setTimeout(function() {
				scoreBoard.html('<span class="peek-time">1 Second remaining</span>');
		}, 1000);

		setTimeout(function() {
				updateScore(scoreBoard, currentScore);
				$('.grid').addClass('flipback card_bg');
				play();
				//game_on = true;
		}, 2000);
	}

	Boxy.confirm("<h3>Welcome to Color Memory Game!!</h3><p>Test your memory by clicking on the two same colored grids, score the highest points and get a chace to be on the leaderboard.</p><h3>Rules -</h3><ol><li><strong>+1</strong> point for each correct match</li><li><strong>-1</strong> point for each wrong match</li><li>You will be given two seconds to memorize the location of the color grids</li></ol><p>All the best!!</p><p>Click OK to play.</p>", function() { InitBoard(); });
	$('.boxy-btn1').focus();

});

function shuffle(v){
    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
    return v;
};

function updateScore(scoreBoard, score){
	scoreBoard.html('<span class="score">Score: <strong>'+score+'</strong></span>');
}

function keyPress(e) {
	var key = e.which || e.keyCode;
	switch (key) {
		case 37:
			if($('.focus').prev().get(0)){
				$('.focus').removeClass('focus').prev().addClass('focus').end();
			} 
			break;
		case 39:
			if($('.focus').next().get(0)){
				$('.focus').removeClass('focus').next().addClass('focus').end();
			}
			break;
		case 38:
			if($('.focus').prev().prev().prev().prev().get(0)){
				$('.focus').removeClass('focus').prev().prev().prev().prev().addClass('focus').end();
			}
			break;
		case 40:
			if($('.focus').next().next().next().next().get(0)){
				$('.focus').removeClass('focus').next().next().next().next().addClass('focus').end();
			}
			break;
		case 13:
			$('.focus').trigger('click');
			break;
	}
}