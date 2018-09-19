
const fetch = require('sketch-polyfill-fetch')
let UI = require('sketch/ui')


const sketch = require('sketch')

// Global initalised variables from 'context' 
var doc, plugin, iconImage

var defaults // User Defaults for saving data

function onSetUp(context) {
  doc = context.document
  plugin = context.plugin
  iconImage = NSImage.alloc().initByReferencingFile(plugin.urlForResourceNamed('Assets/icon.png').path())
}


export default function(context) {


  // sets all of the variables and injects the icon for the rest of the plugin
  onSetUp(context)

  // Set up sign up window
  var userInput = COSAlertWindow.new();

  userInput.setIcon(iconImage);
	userInput.setMessageText("Log in to FusionCode");
	userInput.addTextLabelWithValue("Username");
	userInput.addTextFieldWithValue("");
	userInput.addTextLabelWithValue("Password");
	userInput.addTextFieldWithValue("");
	userInput.addButtonWithTitle('Submit');
	userInput.addButtonWithTitle('Cancel');

  // activate sign in popup
	var responseCode = userInput.runModal();

  // put results of sign in into an object
  let data        =  {};
  data.email      = userInput.viewAtIndex(1).stringValue();
  data.password   = userInput.viewAtIndex(3).stringValue();

  //create a loader so the user knows something is happening
      // OPTION 1
  // UI.alert('lol', 'exporting project')
      // OPTION 2
  // var loader = COSAlertWindow.new();
  // loader.setIcon(iconImage);
	// loader.setMessageText("exporting project");
  // loader.runModal();


  // make post request to authenticate the user and get the key
  fetch('http://159.89.34.47:5002/api/v1/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    })
    .then(response => response.json())
    .then(json => sendData(json.data.token))
    .catch( err => {
      // let the user know they logged incorrectly
      var userInput = COSAlertWindow.new();

      userInput.setIcon(iconImage);
    	userInput.setMessageText("Incorrect username or password");
    	userInput.addButtonWithTitle('Okay');

    	var responseCode = userInput.runModal();
    })


}

function sendData(token) {

// get document from the sketch app
const Document = sketch.fromNative(context.document)

// put the documnent and token in the data object for the post request
let data = {
  data: JSON.stringify(Document),
  token: token
}
// set a loading modal so the user knows something is happening

// send document and token to the fusion code backend
fetch('http://159.89.34.47:5002/api/v1/project/import/sketch', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: data
 })
 .then(res => {

   // let the user know success
   var userInput = COSAlertWindow.new();

   userInput.setIcon(iconImage);
   userInput.setMessageText("Your project has been sent to Fusioncode");
   userInput.addButtonWithTitle('Okay');

   var responseCode = userInput.runModal();

 })
 .catch( err => {
   // let the user know something bad happenned
   var userInput = COSAlertWindow.new();

   userInput.setIcon(iconImage);
   userInput.setMessageText("Something went wrong please try again");
   userInput.addButtonWithTitle('Okay');

   var responseCode = userInput.runModal();
 })
}
