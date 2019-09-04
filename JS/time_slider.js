/**
 * Created by johann on 08.07.19.
 */
"use strict";
var Timeslider = (function() {
  function Timeslider(configuration) {
    this.timestamps = [];
    this.first = configuration.first;
    this.last = configuration.last;
    this.current = configuration.current;
    this.interval = configuration.interval;
    if (configuration.onChange == null) {
      this.onChange = function(newTimestamp, previousTimestamp) {
        console.log(newTimestamp, previousTimestamp);
      };
    } else {
      this.onChange = configuration.onChange;
    }
    this.shown = this.first;
    for (
      var o = this.first;
      o <= this.last && (o - this.first) % this.interval == 0;
      o = o + this.interval
    ) {
      this.timestamps.push(o);
    }
    var style = document.createElement("style");
    document.getElementById("map").style.zIndex = "-999";
    var forwardButton = document.createElement("button");
    forwardButton.setAttribute("id", "forwardButton");
    forwardButton.innerHTML = "Do Something";
    // 2. Append somewhere
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(forwardButton);
    // 3. Add event handler
    forwardButton.addEventListener("click", this.onForward);
  }
  Timeslider.prototype.onForward = function() {
    var nextTimestamp = this.shown + this.interval;
    this.onChange(nextTimestamp, this.shown);
  };
  Timeslider.prototype.onBackwards = function() {
    var nextTimestamp = this.shown - this.interval;
    this.onChange(nextTimestamp, this.shown);
  };
  return Timeslider;
})();
export { Timeslider };
