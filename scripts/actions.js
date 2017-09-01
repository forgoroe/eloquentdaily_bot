module.exports.tweet = function(T, statusObject){
	T.post('statuses/update', statusObject, tweeted)

	function tweeted(err, data, response){
		if(err){
			console.log('There was an error', err);
		} else{
			console.log('Tweet posted!');
		}
	}
};

module.exports.search = function(T, params){
	T.get('search/tweets', params, tweetsFound)

	function tweetsFound(err, data, response){
		console.log(data)
	}
};