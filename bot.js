console.log('bot starting');

var Twit = require('twit');
var config = require('./config');
var actions = require('./actions');

var T = new Twit(config.keys);

actions.tweet(T, {status: 'Testing again.'});

//search params
var params = {
	q: 'sonic mania',
	count: 1,
}

actions.search(T, params);