var Twit = require('twit');
var config = require('./config');

console.log('beep boop', '\n');

var T = new Twit(config.keys);

/*
When one of my followers tweet something, check the contents of their tweets. If those tweets
contain at least one of a particular keyword, post a tweet modifying those keywords with my own.
*/
var keywords = /witnesses|allegedly|new study|rebuild|space|google glass|smartphone|electric|senator|\bcar\b|election|congressional leaders|homeland security|could not be reached for comment/gi;


// setInterval(run, 1000*60*15);
run();

function run(){
	retrieveTweets()
		.then(modifyTweets)
		.catch((err)=>
			console.log(err))
		//.then(postToTwitter);
}

function retrieveTweets(){
	return T.get('friends/list')
		.then(checkTweets)
		.catch(()=> {console.log("Couldn't retrieve tweets")}); //T.get (twit API) doesn't throw exception and returns an undefined object, which is why I catch error on undefined
}

function postToTwitter(newTweetsParam){
	let message = '.@'+ newTweetsParam[0].author + " " + newTweetsParam[0].tweet + " #xkcd";

	statusObject = {
		status: message,
	}
	
	T.post('statuses/update', statusObject).catch((err) => console.log(err)).then(() =>
		console.log('Tweet posted: ', message));	
}

function checkTweets(result){
	let author = result.data.users;
	var toModify = [];

	for (var i = 0; i < result.data.users.length; i++) {
		let author = result.data.users[i].screen_name;
		let originalTweet = result.data.users[i].status.text;

		if(result.data.users[i].status){
			let needsModifying = checkForTriggers(originalTweet);

			if(needsModifying){
				console.log("NEEDS MODIFYING:", result.data.users[i].screen_name + ':', result.data.users[i].status.text, '\n\n');
				toModify.push({'author': author, 'tweet': originalTweet});
			}
		}
	}

	let promise = new Promise(function(resolve, reject){
		if(toModify.length){
			resolve(toModify);
		} else {
			let currentdate = new Date(); 
			let datetime = "Last Sync: "
	        + currentdate.getHours() + ":"  
	        + currentdate.getMinutes() + ":" 
	        + currentdate.getSeconds();

	        console.log('No tweets to modify');
		}
	});
	return promise;
}

function checkForTriggers(originalTweet){
	if(originalTweet.search(keywords)!==-1){
		return true
	}
	return false;
}


function modifyTweets(stuffToModify){
	let newTweets = [];
	var mapObj = {
   		witnesses: "these dudes I know",
   		allegedly: "kinda probably",
   		'new study': "tumblr post",
   		rebuild: "avenge",
   		space: "spaaace",
   		'google glass': "virtual boy",
   		smartphone: "pokedex", 
   		electric: "atomic",
   		senator: "elf-lord",
   		car: "cat",
   		election: "eating contest",
   		'congressional leaders': "river spirits",
   		'homeland security': "homestar runner", 
   		'could not be reached for comment': "is guilty and everyone knows it"
	};

	for(var i = 0; i<stuffToModify.length; i++){
			var modifiedTweet =	stuffToModify[i].tweet.replace(keywords, function(matched){
			return mapObj[matched];
		});

		newTweets.push({
			author: stuffToModify[i].author,
			tweet: modifiedTweet
		});
	}

	return newTweets;
}