var CONSUMER_KEY = PropertiesService.getScriptProperties().getProperty('CONSUMER_KEY')
var CONSUMER_SECRET = PropertiesService.getScriptProperties().getProperty('CONSUMER_SECRET');
var TOKEN = PropertiesService.getScriptProperties().getProperty('TOKEN');
var TOKEN_SECRET = PropertiesService.getScriptProperties().getProperty('TOKEN_SECRET');

function main() {
  var service = getService();
  Logger.log(service.getCallbackUrl());
  var tweets = pickUpTweets(); 
  if (tweets == []) {
    Logger.log('Tweets not found');
    return false; 
  }
  for (var i = 0, il = tweets.length; i < il; i++ ) {
    var tweet = tweets[i][0] + ' ' + tweets[i][1]
      if (service.hasAccess()) {
        var url = 'https://api.twitter.com/1.1/statuses/update.json';
        var payload = {
          status: tweet
        };
        try{
          var response = service.fetch(url, {
            method: 'post',
            payload: payload,
            muteHttpExceptions: true
          });
      }catch(e) {
        Logger.log('Error:')
        Logger.log(e)
        print(e)
      }
        var result = JSON.parse(response.getContentText());
        Logger.log(JSON.stringify(result, null, 2));
      } else {
        var authorizationUrl = service.authorize();
        Logger.log('Check URL: %s',
            authorizationUrl);
      }
    }
} 

function doGet() {
  return HtmlService.createHtmlOutput(ScriptApp.getService().getUrl());
}

function reset() {
  var service = getService();
  service.reset();
}

function getService() {
  return OAuth1.createService('Twitter')
      .setConsumerKey(CONSUMER_KEY) 
      .setConsumerSecret(CONSUMER_SECRET) 
      .setAccessToken(TOKEN, TOKEN_SECRET) 

      // oAuthエンドポイントURL
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')

      .setCallbackFunction('authCallback') 
}

function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success');
  } else {
    return HtmlService.createHtmlOutput('Failed');
  }
}

function pickUpTweets() {
  var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('tweets')
  if (targetSheet.getLastRow() == 1) { return "" } 
  var cells = targetSheet.getRange(2, 1, targetSheet.getLastRow()-1,3).getValues(); 
  var list_tweets = [];
  for (var i = 0, il = cells.length; i < il; i++ ) {
    var text_date_sheet = cells[i][2]
    var text_today = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd")
    if (text_date_sheet == text_today){
      list_tweets.push(cells[i])
    }
  }
  return list_tweets;
}