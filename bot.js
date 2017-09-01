var Twit = require('twit');
var config = require('./config');
var actions = require('./scripts/actions');
var MarkovChain = require('markovchain');

var fs = require('fs');
var data = readFile('./dataSets/eloquence.txt', 'utf8')

console.log('beep boop');

function readFile(path, encoding){
	var data = fs.readFileSync(path, encoding);
	return data;
}

function generateMarkov(data){

	var useUpperCase = function(wordList) {
	  var tmpList = Object.keys(wordList).filter(function(word) {
	    return word[0] >= 'A' && word[0] <= 'Z'
	  })
	  return tmpList[~~(Math.random()*tmpList.length)]
	}

	return new MarkovChain(data).start('a').end(140).process();
}

console.log(generateMarkov(data));
var resultPlus = generateMarkov();

/*var T = new Twit(config.keys);

actions.tweet(T, {status: 'Testing again.'});

//search params
var params = {
	q: 'sonic mania',
	count: 1,
}

actions.search(T, params);

*/
