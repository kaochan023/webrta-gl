# WebGL chat service for unity games

this repo provides the basic functionality for starting voice chat with unity webgl games.

it handels the voice chat on the browser and exposes a set of functions to unity to be used for starting and ending voice sessions

the voice chat itself is handeled by [socket.io](https://socket.io/) which is based on [Websocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
## Installation

clone the repo using

``
git clone https://github.com/Gold3nEagle/UnityWebGLVoiceChatServer-Socket.io.git
``

## Running the server

pre-requsits: -

- npm
- node
- nodemon

to run the server use

``
npm run dev
``


## putting your unity webgl build on the server

you can add all the files of your build in the public folder of the project, make sure that the html page is called "index.html".

next, ensure that you put both the "client js" file and socket io cdn link at the bottom of the page like this

```html
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js" integrity="sha384-/KNQL8Nu5gCHLqwqfQjA689Hhoqgi2S84SNUxC3roTe4EhJ9AfLkp8QiQcU8AMzI" crossorigin="anonymous"></script>
    <script src="./js/client.js"></script>
</body>
```
### giving access to the unity instance to the browser (optional)

this is optional, for at the momment, the browser does not need to send message to the unity game instance

also make sure that you store your "unityInstance" variable on "window" variable
like this

note: this section of the code is found with the build of the webgl game
```javascript
  }).then((unityInstance) => {
          window.unityInstance = unityInstance;
```


## adding the .jslib file and using the WebVoiceChatHandler.cs Class

the two files in the UnityFiles Folder are meant to be used in your unity game.

those two files will allow unity to communicate with the browser where the jslib acts as the birdge and the WebVoiceChatHandler acts as the interface to use the features.

for more info check the wiki of the repo about the files.