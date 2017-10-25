/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * uWebSockets Adapter
 * For use with uws-server.js
 * networked-scene: serverURL needs to be ws://localhost:8080 when running locally
 */
var UwsAdapter = function () {
  function UwsAdapter() {
    _classCallCheck(this, UwsAdapter);

    var location = window.location;

    this.app = "default";
    this.room = "default";
    this.connectedClients = [];
    this.roomOccupantListener = null;
  }

  _createClass(UwsAdapter, [{
    key: "setServerUrl",
    value: function setServerUrl(wsUrl) {
      this.wsUrl = wsUrl;
    }
  }, {
    key: "setApp",
    value: function setApp(appName) {
      this.app = appName;
    }
  }, {
    key: "setRoom",
    value: function setRoom(roomName) {
      this.room = roomName;
    }
  }, {
    key: "setWebRtcOptions",
    value: function setWebRtcOptions(options) {
      // No webrtc support
    }
  }, {
    key: "setServerConnectListeners",
    value: function setServerConnectListeners(successListener, failureListener) {
      this.connectSuccess = successListener;
      this.connectFailure = failureListener;
    }
  }, {
    key: "setRoomOccupantListener",
    value: function setRoomOccupantListener(occupantListener) {
      this.roomOccupantListener = occupantListener;
    }
  }, {
    key: "setDataChannelListeners",
    value: function setDataChannelListeners(openListener, closedListener, messageListener) {
      this.openListener = openListener;
      this.closedListener = closedListener;
      this.messageListener = messageListener;
    }
  }, {
    key: "connect",
    value: function connect() {
      if (!this.wsUrl || this.wsUrl === "/") {
        if (location.protocol === "https:") {
          this.wsUrl = "wss://" + location.host;
        } else {
          this.wsUrl = "ws://" + location.host;
        }
      }

      var socket = new WebSocket(this.wsUrl);
      var self = this;

      // WebSocket connection opened
      socket.addEventListener("open", function (event) {
        self.sendJoinRoom();
      });

      // WebSocket connection error
      socket.addEventListener("error", function (event) {
        self.connectFailure();
      });

      // Listen for messages
      socket.addEventListener("message", function (event) {
        // console.log('Message from server', event.data);

        var message = JSON.parse(event.data);

        if (message.type === "roomOccupantsChange") {
          self.receivedOccupants(message.data.occupants);
        } else if (message.type === "connectSuccess") {
          var data = message.data;
          var clientId = data.id;
          self.connectSuccess(clientId);
        } else if (message.type == "send" || message.type == "broadcast") {
          var from = message.from;
          var msgData = message.data;

          var dataType = msgData.type;
          var data = msgData.data;
          self.messageListener(from, dataType, data);
        }
      });

      this.socket = socket;
    }
  }, {
    key: "sendJoinRoom",
    value: function sendJoinRoom() {
      this._send("joinRoom", { room: this.room });
    }
  }, {
    key: "receivedOccupants",
    value: function receivedOccupants(occupants) {
      var occupantMap = {};
      for (var i = 0; i < occupants.length; i++) {
        if (occupants[i] != NAF.clientId) {
          occupantMap[occupants[i]] = true;
        }
      }
      this.roomOccupantListener(occupantMap);
    }
  }, {
    key: "shouldStartConnectionTo",
    value: function shouldStartConnectionTo(clientId) {
      return true;
    }
  }, {
    key: "startStreamConnection",
    value: function startStreamConnection(clientId) {
      this.connectedClients.push(clientId);
      this.openListener(clientId);
    }
  }, {
    key: "closeStreamConnection",
    value: function closeStreamConnection(clientId) {
      var index = this.connectedClients.indexOf(clientId);
      if (index > -1) {
        this.connectedClients.splice(index, 1);
      }
      this.closedListener(clientId);
    }
  }, {
    key: "getConnectStatus",
    value: function getConnectStatus(clientId) {
      var connected = this.connectedClients.indexOf(clientId) != -1;

      if (connected) {
        return NAF.adapters.IS_CONNECTED;
      } else {
        return NAF.adapters.NOT_CONNECTED;
      }
    }
  }, {
    key: "sendData",
    value: function sendData(clientId, dataType, data) {
      // console.log('sending data', dataType, data);
      var sendPacket = {
        target: clientId,
        type: dataType,
        data: data
      };
      this._send("send", sendPacket);
    }
  }, {
    key: "sendDataGuaranteed",
    value: function sendDataGuaranteed(clientId, dataType, data) {
      this.sendData(clientId, dataType, data);
    }
  }, {
    key: "broadcastData",
    value: function broadcastData(dataType, data) {
      var broadcastPacket = {
        type: dataType,
        data: data
      };
      this._send("broadcast", broadcastPacket);
    }
  }, {
    key: "broadcastDataGuaranteed",
    value: function broadcastDataGuaranteed(dataType, data) {
      this.broadcastData(dataType, data);
    }
  }, {
    key: "_send",
    value: function _send(dataType, data) {
      var packet = {
        from: NAF.clientId,
        type: dataType,
        data: data
      };
      var packetStr = JSON.stringify(packet);
      this.socket.send(packetStr);
    }
  }]);

  return UwsAdapter;
}();

NAF.adapters.register("uws", UwsAdapter);

module.exports = UwsAdapter;

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMjUxODg0MTNjNjAyMjhhZjYxMmUiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIlV3c0FkYXB0ZXIiLCJsb2NhdGlvbiIsIndpbmRvdyIsImFwcCIsInJvb20iLCJjb25uZWN0ZWRDbGllbnRzIiwicm9vbU9jY3VwYW50TGlzdGVuZXIiLCJ3c1VybCIsImFwcE5hbWUiLCJyb29tTmFtZSIsIm9wdGlvbnMiLCJzdWNjZXNzTGlzdGVuZXIiLCJmYWlsdXJlTGlzdGVuZXIiLCJjb25uZWN0U3VjY2VzcyIsImNvbm5lY3RGYWlsdXJlIiwib2NjdXBhbnRMaXN0ZW5lciIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwicHJvdG9jb2wiLCJob3N0Iiwic29ja2V0IiwiV2ViU29ja2V0Iiwic2VsZiIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInNlbmRKb2luUm9vbSIsIm1lc3NhZ2UiLCJKU09OIiwicGFyc2UiLCJkYXRhIiwidHlwZSIsInJlY2VpdmVkT2NjdXBhbnRzIiwib2NjdXBhbnRzIiwiY2xpZW50SWQiLCJpZCIsImZyb20iLCJtc2dEYXRhIiwiZGF0YVR5cGUiLCJfc2VuZCIsIm9jY3VwYW50TWFwIiwiaSIsImxlbmd0aCIsIk5BRiIsInB1c2giLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJjb25uZWN0ZWQiLCJhZGFwdGVycyIsIklTX0NPTk5FQ1RFRCIsIk5PVF9DT05ORUNURUQiLCJzZW5kUGFja2V0IiwidGFyZ2V0Iiwic2VuZERhdGEiLCJicm9hZGNhc3RQYWNrZXQiLCJicm9hZGNhc3REYXRhIiwicGFja2V0IiwicGFja2V0U3RyIiwic3RyaW5naWZ5Iiwic2VuZCIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7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YixDQUFzQixLQUF0QixFQUE2QjdELFVBQTdCOztBQUVBOEQsT0FBT0MsT0FBUCxHQUFpQi9ELFVBQWpCLEMiLCJmaWxlIjoibmFmLXV3cy1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMjUxODg0MTNjNjAyMjhhZjYxMmUiLCIvKipcclxuICogdVdlYlNvY2tldHMgQWRhcHRlclxyXG4gKiBGb3IgdXNlIHdpdGggdXdzLXNlcnZlci5qc1xyXG4gKiBuZXR3b3JrZWQtc2NlbmU6IHNlcnZlclVSTCBuZWVkcyB0byBiZSB3czovL2xvY2FsaG9zdDo4MDgwIHdoZW4gcnVubmluZyBsb2NhbGx5XHJcbiAqL1xyXG5jbGFzcyBVd3NBZGFwdGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHZhciBsb2NhdGlvbiA9IHdpbmRvdy5sb2NhdGlvbjtcclxuXHJcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xyXG4gICAgdGhpcy5yb29tID0gXCJkZWZhdWx0XCI7XHJcbiAgICB0aGlzLmNvbm5lY3RlZENsaWVudHMgPSBbXTtcclxuICAgIHRoaXMucm9vbU9jY3VwYW50TGlzdGVuZXIgPSBudWxsO1xyXG4gIH1cclxuXHJcbiAgc2V0U2VydmVyVXJsKHdzVXJsKSB7XHJcbiAgICB0aGlzLndzVXJsID0gd3NVcmw7XHJcbiAgfVxyXG5cclxuICBzZXRBcHAoYXBwTmFtZSkge1xyXG4gICAgdGhpcy5hcHAgPSBhcHBOYW1lO1xyXG4gIH1cclxuXHJcbiAgc2V0Um9vbShyb29tTmFtZSkge1xyXG4gICAgdGhpcy5yb29tID0gcm9vbU5hbWU7XHJcbiAgfVxyXG5cclxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcclxuICAgIC8vIE5vIHdlYnJ0YyBzdXBwb3J0XHJcbiAgfVxyXG5cclxuICBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzKHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKSB7XHJcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xyXG4gICAgdGhpcy5jb25uZWN0RmFpbHVyZSA9IGZhaWx1cmVMaXN0ZW5lcjtcclxuICB9XHJcblxyXG4gIHNldFJvb21PY2N1cGFudExpc3RlbmVyKG9jY3VwYW50TGlzdGVuZXIpIHtcclxuICAgIHRoaXMucm9vbU9jY3VwYW50TGlzdGVuZXIgPSBvY2N1cGFudExpc3RlbmVyO1xyXG4gIH1cclxuXHJcbiAgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMob3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKSB7XHJcbiAgICB0aGlzLm9wZW5MaXN0ZW5lciA9IG9wZW5MaXN0ZW5lcjtcclxuICAgIHRoaXMuY2xvc2VkTGlzdGVuZXIgPSBjbG9zZWRMaXN0ZW5lcjtcclxuICAgIHRoaXMubWVzc2FnZUxpc3RlbmVyID0gbWVzc2FnZUxpc3RlbmVyO1xyXG4gIH1cclxuXHJcbiAgY29ubmVjdCgpIHtcclxuICAgIGlmICghdGhpcy53c1VybCB8fCB0aGlzLndzVXJsID09PSBcIi9cIikge1xyXG4gICAgICBpZiAobG9jYXRpb24ucHJvdG9jb2wgPT09IFwiaHR0cHM6XCIpIHtcclxuICAgICAgICB0aGlzLndzVXJsID0gXCJ3c3M6Ly9cIiArIGxvY2F0aW9uLmhvc3Q7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy53c1VybCA9IFwid3M6Ly9cIiArIGxvY2F0aW9uLmhvc3Q7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh0aGlzLndzVXJsKTtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAvLyBXZWJTb2NrZXQgY29ubmVjdGlvbiBvcGVuZWRcclxuICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICBzZWxmLnNlbmRKb2luUm9vbSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2ViU29ja2V0IGNvbm5lY3Rpb24gZXJyb3JcclxuICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgc2VsZi5jb25uZWN0RmFpbHVyZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gTGlzdGVuIGZvciBtZXNzYWdlc1xyXG4gICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKCdNZXNzYWdlIGZyb20gc2VydmVyJywgZXZlbnQuZGF0YSk7XHJcblxyXG4gICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XHJcblxyXG4gICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcInJvb21PY2N1cGFudHNDaGFuZ2VcIikge1xyXG4gICAgICAgIHNlbGYucmVjZWl2ZWRPY2N1cGFudHMobWVzc2FnZS5kYXRhLm9jY3VwYW50cyk7XHJcbiAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSBcImNvbm5lY3RTdWNjZXNzXCIpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG1lc3NhZ2UuZGF0YTtcclxuICAgICAgICB2YXIgY2xpZW50SWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHNlbGYuY29ubmVjdFN1Y2Nlc3MoY2xpZW50SWQpO1xyXG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PSBcInNlbmRcIiB8fCBtZXNzYWdlLnR5cGUgPT0gXCJicm9hZGNhc3RcIikge1xyXG4gICAgICAgIHZhciBmcm9tID0gbWVzc2FnZS5mcm9tO1xyXG4gICAgICAgIHZhciBtc2dEYXRhID0gbWVzc2FnZS5kYXRhO1xyXG5cclxuICAgICAgICB2YXIgZGF0YVR5cGUgPSBtc2dEYXRhLnR5cGU7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBtc2dEYXRhLmRhdGE7XHJcbiAgICAgICAgc2VsZi5tZXNzYWdlTGlzdGVuZXIoZnJvbSwgZGF0YVR5cGUsIGRhdGEpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnNvY2tldCA9IHNvY2tldDtcclxuICB9XHJcblxyXG4gIHNlbmRKb2luUm9vbSgpIHtcclxuICAgIHRoaXMuX3NlbmQoXCJqb2luUm9vbVwiLCB7IHJvb206IHRoaXMucm9vbSB9KTtcclxuICB9XHJcblxyXG4gIHJlY2VpdmVkT2NjdXBhbnRzKG9jY3VwYW50cykge1xyXG4gICAgdmFyIG9jY3VwYW50TWFwID0ge307XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9jY3VwYW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAob2NjdXBhbnRzW2ldICE9IE5BRi5jbGllbnRJZCkge1xyXG4gICAgICAgIG9jY3VwYW50TWFwW29jY3VwYW50c1tpXV0gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnJvb21PY2N1cGFudExpc3RlbmVyKG9jY3VwYW50TWFwKTtcclxuICB9XHJcblxyXG4gIHNob3VsZFN0YXJ0Q29ubmVjdGlvblRvKGNsaWVudElkKSB7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xyXG4gICAgdGhpcy5jb25uZWN0ZWRDbGllbnRzLnB1c2goY2xpZW50SWQpO1xyXG4gICAgdGhpcy5vcGVuTGlzdGVuZXIoY2xpZW50SWQpO1xyXG4gIH1cclxuXHJcbiAgY2xvc2VTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XHJcbiAgICB2YXIgaW5kZXggPSB0aGlzLmNvbm5lY3RlZENsaWVudHMuaW5kZXhPZihjbGllbnRJZCk7XHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICB0aGlzLmNvbm5lY3RlZENsaWVudHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICAgIHRoaXMuY2xvc2VkTGlzdGVuZXIoY2xpZW50SWQpO1xyXG4gIH1cclxuXHJcbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xyXG4gICAgdmFyIGNvbm5lY3RlZCA9IHRoaXMuY29ubmVjdGVkQ2xpZW50cy5pbmRleE9mKGNsaWVudElkKSAhPSAtMTtcclxuXHJcbiAgICBpZiAoY29ubmVjdGVkKSB7XHJcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuSVNfQ09OTkVDVEVEO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5OT1RfQ09OTkVDVEVEO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZygnc2VuZGluZyBkYXRhJywgZGF0YVR5cGUsIGRhdGEpO1xyXG4gICAgdmFyIHNlbmRQYWNrZXQgPSB7XHJcbiAgICAgIHRhcmdldDogY2xpZW50SWQsXHJcbiAgICAgIHR5cGU6IGRhdGFUeXBlLFxyXG4gICAgICBkYXRhOiBkYXRhXHJcbiAgICB9O1xyXG4gICAgdGhpcy5fc2VuZChcInNlbmRcIiwgc2VuZFBhY2tldCk7XHJcbiAgfVxyXG5cclxuICBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XHJcbiAgICB0aGlzLnNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XHJcbiAgfVxyXG5cclxuICBicm9hZGNhc3REYXRhKGRhdGFUeXBlLCBkYXRhKSB7XHJcbiAgICB2YXIgYnJvYWRjYXN0UGFja2V0ID0ge1xyXG4gICAgICB0eXBlOiBkYXRhVHlwZSxcclxuICAgICAgZGF0YTogZGF0YVxyXG4gICAgfTtcclxuICAgIHRoaXMuX3NlbmQoXCJicm9hZGNhc3RcIiwgYnJvYWRjYXN0UGFja2V0KTtcclxuICB9XHJcblxyXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XHJcbiAgICB0aGlzLmJyb2FkY2FzdERhdGEoZGF0YVR5cGUsIGRhdGEpO1xyXG4gIH1cclxuXHJcbiAgX3NlbmQoZGF0YVR5cGUsIGRhdGEpIHtcclxuICAgIHZhciBwYWNrZXQgPSB7XHJcbiAgICAgIGZyb206IE5BRi5jbGllbnRJZCxcclxuICAgICAgdHlwZTogZGF0YVR5cGUsXHJcbiAgICAgIGRhdGE6IGRhdGFcclxuICAgIH07XHJcbiAgICB2YXIgcGFja2V0U3RyID0gSlNPTi5zdHJpbmdpZnkocGFja2V0KTtcclxuICAgIHRoaXMuc29ja2V0LnNlbmQocGFja2V0U3RyKTtcclxuICB9XHJcbn1cclxuXHJcbk5BRi5hZGFwdGVycy5yZWdpc3RlcihcInV3c1wiLCBVd3NBZGFwdGVyKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVXdzQWRhcHRlcjtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luZGV4LmpzIl0sInNvdXJjZVJvb3QiOiIifQ==