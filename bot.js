var Twit = require('twit');
var config = require('./config');
var xkcd = require('./xkcdSubsParam');

console.log('beep boop', '\n');
var alreadyPosted = [];
var T = new Twit(config.keys);

/*
When one of my followers tweet something, check the contents of their tweets. If those tweets
contain at least one of a particular keyword, post a tweet modifying those keywords with my own.
*/

run();
setInterval(run, 1000*60*15);
setInterval(clearAlreadyPosted, 1000*60*60*2);

function run(){
	retrieveTweets()
		.then(modifyTweets)
		.catch((err)=>
			console.log(err))
		.then(postToTwitter);
}

function clearAlreadyPosted(){
	alreadyPosted.length = 0;
	console.log('CLEARED LIST OF ALREADY POSTED TWEETS.', getCurrentTime());
}

function retrieveTweets(){
	return T.get('friends/list')
		.then(checkTweets)
		.catch(()=> {console.log("Couldn't retrieve tweets")}); //T.get (twit API) doesn't throw exception and returns an object with undefined keys, which is why error gets caught on the "modifyTweets" function call
}

function postToTwitter(newTweetsParam){
	var toTweet;
	if(newTweetsParam.length){
		toTweet = newTweetsParam.pop();
		var message = '.@'+ toTweet.author + " " + toTweet.tweet + " #xkcd";

		if (alreadyPosted.indexOf(message) == -1){
			let statusObject = {
			status: message,
			}
			
			T.post('statuses/update', statusObject).catch((err) => console.log(err)).then(() => {
				console.log('POSTED TO TWITTER: ', message, getCurrentTime(), '\n');
				alreadyPosted.push(message);
			});

		}

		setTimeout(() => postToTwitter(newTweetsParam), 5000);
	}
}

function checkTweets(result){
	var toModify = [];

	console.log('Checking for Tweets... \n');

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
	        console.log('No tweets to modify.', getCurrentTime());
		}
	});
	return promise;
}

function checkForTriggers(originalTweet){
	if(originalTweet.search(xkcd.keywords)!==-1){
		return true
	}
	return false;
}


function modifyTweets(stuffToModify){
	let newTweets = [];

	for(var i = 0; i<stuffToModify.length; i++){
			var modifiedTweet =	stuffToModify[i].tweet.replace(xkcd.keywords, function(matched){
			let lowerCaseMatched = matched.toLowerCase();
			return xkcd.substitutionsObj[lowerCaseMatched];
		});

		if(modifiedTweet.length>140){
			console.log('Tweet max length exceeded by '+ `${modifiedTweet.length-140}`+'. Trimming...\n');
			modifiedTweet = modifiedTweet.substring(0,133) + "...";
		}

		newTweets.push({
			author: stuffToModify[i].author,
			tweet: modifiedTweet
		});
	}

	return newTweets;
}

function getCurrentTime(){
	let currentdate = new Date(); 
			let time = "Last Sync: "
	        + currentdate.getHours() + ":"  
	        + currentdate.getMinutes() + ":" 
	        + currentdate.getSeconds();
	
	return time;
}