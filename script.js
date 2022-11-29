if ("serviceWorker" in navigator) {
 if (navigator.serviceWorker.controller) {
  console.log("[PWA Builder] active service worker found, no need to register");
 } else {
  navigator.serviceWorker
  .register("pwabuilder-sw.js", {
   scope: "./"
  })
  .then(function(reg) {
   console.log("[PWA Builder] Service worker has been registered for scope: " + reg.scope);
  });
 }
}

var limit = 200;

function listen(id) {
  var msg = document.getElementById(id).value;
  msg = new SpeechSynthesisUtterance(msg);
  var voicesList = speechSynthesis.getVoices();
  msg.voice = voicesList.find((voice) => voice.lang === 'en-US');
  speechSynthesis.speak(msg);
}

function searchReddit() {
  event.preventDefault();
  document.getElementById("id01").style.display = "none";
  document.getElementById("notice").innerText = "";

  var term = document.getElementById("searchterm").value;
  var user = document.getElementById("username").value.replace(" ","");
  var sub = document.getElementById("subreddit").value.replace(" ","");
  var submission = document.getElementById("submission").checked;


  var n = Date.now();
  if (submission) {
    w3.getHttpObject("https://api.pushshift.io/reddit/submission/search?author=" + user + "&limit=" + limit + "&subreddit=" + sub + "&q=" + term, showAll);
  } else
    w3.getHttpObject("https://api.pushshift.io/reddit/search?author=" + user + "&limit=" + limit + "&subreddit=" + sub + "&q=" + term, showAll);
}

function showAll(myObject) {
  var myArray = myObject.data;
  console.log(myArray);
  for (i = 0; i < myArray.length; i++) {
    var d = new Date(myArray[i]["created_utc"] * 1000);
    myArray[i]["postId"] = myArray[i]["link_id"] ? myArray[i]["link_id"].replace("t3_", "") : myArray[i]["id"];
    myArray[i]["shortId"] = myArray[i]["link_id"] ? myArray[i]["parent_id"].replace("t3_", "") : myArray[i]["id"];
    myArray[i]["timeDiff"] = secondsToDhms(UTCTimestamp() - myArray[i]["created_utc"]);

    if(myArray[i]["body"]) {
      myArray[i]["bodyLength"] = myArray[i]["body"].length;
      console.log(myArray[i]["body"].replaceAll('"','&quot;'));
      myArray[i]["body"] = myArray[i]["body"].replace('"','&quot;');
    }
  }
  var submission = document.getElementById("submission").checked;
  if (submission) {
    for (i = 0; i < myArray.length; i++) {
      myArray[i]["body"] = myArray[i]["title"] + "\n\n" + myArray[i]["selftext"];
      myArray[i]["body"] = myArray[i]["body"].replaceAll('\n',' &bull; ');
      myArray[i]["bodyLength"] = myArray[i]["body"].length;
      myArray[i]["permalink"] = "/" + myArray[i]["id"];
    }
  }

  w3.displayObject("id01", myObject);
  
  if(myArray.length > 0) {
   document.getElementById("id01").style.display = "";
  }
  document.getElementById("notice").innerText = myArray.length + " Results Found"
}

function sort2 (arr, key, order = "asc") {
  
  return arr.sort((function(index){
    return function(a, b){
      if(order == "desc") return (a[index] === b[index] ? 0 : (a[index] > b[index] ? -1 : 1));
      return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
    };
  })(key))
}

function copyText(id) {
 var txt = document.getElementById(id);

 txt.select();
 txt.setSelectionRange(0, 99999); /* For mobile devices */

 document.execCommand("copy");
}

function showPost(myObject) {
  var myArray = myObject.data[0];

  var title = myArray["title"];
  var body = myArray["selftext"];
  
  body = mdToHtml(body);
  body = readable(body);

  myArray["body"] = body;
  myArray["timeDiff"] = secondsToDhms(UTCTimestamp() - myArray["created_utc"]);

  w3.displayObject("id01", myArray);
}

function showComments(comments) {
  var data = comments.data;

  for (i = 0; i < data.length; i++) {

    data[i]["body"] = mdToHtml(data[i]["body"]);
    data[i]["comment"] = readable(data[i]["body"]);

    data[i]["timeDiff"] = secondsToDhms(UTCTimestamp() - data[i]["created_utc"]);
  }

  w3.displayObject("comments", comments);  
}

function assignParent(child, parent) {
  var x;
  x[parent] = child;
  return
}

function mdToHtml(text){
  //bold
  var bold = /\*\*(.*?)\*\*/gm;
  var text = text.replace(bold, '<strong>$1</strong>');
  //italics
  var italics = /\*(.*?)\*/gm;
  var text = text.replace(italics, '<em>$1</em>');      
  return text;
}

function readable(text) {
  text = text.replace("\t", " ");

  var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~|])/ig;
  return text.replace(urlRegex, function(url) {
    return '<a href="' + url + '">Link</a>';
  });
  //return text;
}

function UTCTimestamp () {
  var t = new Date();
  var year = t.getUTCFullYear();
  var month = t.getUTCMonth();
  var date = t.getUTCDate();
  var hour = t.getUTCHours();
  var minute = t.getUTCMinutes();
  var second = t.getUTCSeconds();
  
  var utc = Date.UTC(year, month, date, hour, minute, second);
  return utc/1000;
}

function secondsToDhms(seconds) {
  seconds = Number(seconds);
  var y = Math.floor(seconds / (3600*24*365));
  var d = Math.floor(seconds % (3600*24*365) / (3600*24));
  var h = Math.floor(seconds % (3600*24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  var disp = "";

  // var yDisplay = y > 0 ? y + "y " : "";
  // var dDisplay = d > 0 ? d + "d " : "";
  // var hDisplay = h > 0 ? h + "h " : "";
  // var mDisplay = m > 0 ? m + "m " : "";
  // var sDisplay = s > 0 ? s + "s" : "";
  // return yDisplay + dDisplay + hDisplay + mDisplay + sDisplay;

  if(y > 0) disp = y + "y ";
  else if(d > 0) disp = d + "d ";
  else if(h > 0) disp = h + "h ";
  else if(m > 0) disp = m + "m ";
  else if(s > 0) disp = s + "s ";

  return disp;
}
