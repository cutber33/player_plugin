import { brotliCompressSync } from "zlib";

/**
 * Created by johann on 08.07.19.
 */
//type CallbackFunction = (newTimestamp, previousTimestamp) => void;

export class TimeSlider {
  first: number;
  last: number;
  //current: number;
  interval: number;
  public onChange: (newTimestamp: number) => void;
  shown: number;
  animation: boolean;
  play: any;
  startTime: number;
  endTime: number;
  attribution: string;

  public configure(configuration) {
    //Get all configurations
    this.first = configuration.first;
    this.last = configuration.last;
    this.interval = configuration.interval;
    this.animation = false;
    this.endTime = configuration.endTime;
    this.startTime = configuration.startTime;
    this.attribution = configuration.attribution;

    /*
    if (typeof configuration.onChange === "function") {
      this.onChange = configuration.onChange;
    } else {
      console.log("scheisse");
    }

    console.log(this.onChange);

    */
    // Callback Method... needs improvment
    /*
    if (typeof configuration.onChangeCallback === "function") {
      this.onChangeCallback = configuration.onChangeCallback;
    }
    */

    // Round and convert timestamps to unixtime
    this.startTime = Math.round(configuration.startTime / 1000);
    this.endTime = Math.round(configuration.endTime / 1000);

    //find the nearest valid timestamp
    let startTimeRounded = this.roundtoInterval(
      this.startTime,
      this.interval,
      this.first
    );

    //if the timestamp is outside of the available timestamps pick the first available timestamp
    if (startTimeRounded >= this.first) {
      this.first = startTimeRounded;
    }

    //repeat for the last timestamp
    let endTimeRounded = this.roundtoInterval(
      this.endTime,
      this.interval,
      this.first
    );

    if (endTimeRounded <= this.last) {
      this.last = endTimeRounded;
    }

    this.shown = this.first;

    //CSS File
    let style = document.createElement("style");
    style.innerHTML =
      //TODO: https://lengstorf.com/code/learn-rollup-css/
      //TODO: Responsive --> Percentages but min and max width. Not vw for fonts search for better solution. iPad und Smartphone grenze. Eigentlich nur Leiste unten anpassen
      //Überschneidungen in class zusammenfassen

      "body{font-family: Arial, Helvetica, sans-serif} ul {list-style-type: none; padding: 0} p,span,div {color: white} div {background: black; opacity: 0.85} #currentTimestamp {border-radius: 4px; background: black; opacity: 0.85; position: absolute; top :10px; left: 60px; width: 100px; display: flex; justify-content: center; font-size: 1em; flex-direction: column} .controlButton:hover, .timeElement:hover{background: grey}.controlButton:active, .timeElement:active{background: lightblue} .controlButton { color: black; background: white; border: solid 4px black; width: 45px; height: 45px; float: left; text-align: center; vertical-align: middle; line-height: 45px; } #map { z-index: -999; } .controls {display: flex; justify-content: center; align-items: center; cursor: pointer; width: 900px; height: 50px; background: black; opacity: 0.85; position: absolute; bottom: 10px; left: 0; right: 0; border: solid 4px black; border-radius: 4px; margin: 0 auto} #timeSlider{width: 800px; float: left; padding: 20px} .timeElement{float: left; background: white; height: 45px; text-align: center; vertical-align: middle; line-height: 45px; width: 156px; float: left; border-right: 5px solid black} .timeElement:last-child {border-right: 0} #timeProgress {min-width: 5px; background: red; width: " +
      (
        (1 - (this.last - this.shown) / (this.last - this.first)) *
        100
      ).toString() +
      "%" +
      "; position: relative; height: 6px; margin-top: -7px} #startTime {margin-right: -35px;margin-top: 25px} #endTime {margin-left: -35px;margin-top: 25px} #layers{position: absolute; right: 1em; vertical-align: middle; padding: .7em; background: black; opacity: 0.85; top: 1em; border-radius: 4px} .date{text-align: center; padding: 2px; font-size: 2em}" +
      "#attribution {color: #dddddd; font-size: 0.6em;position: absolute;left: 1em;bottom: 1em}";
    document.getElementsByTagName("head")[0].appendChild(style);

    //creates all HTML Elements
    let controls = document.createElement("div");
    controls.setAttribute("class", "controls");
    controls.setAttribute("id", "controlBar");

    let currentTimestamp = document.createElement("div");
    currentTimestamp.setAttribute("id", "currentTimestamp");

    let currentTime = document.createElement("div");
    currentTime.setAttribute("class", "date");
    currentTime.setAttribute("id", "currentTime");

    currentTime.innerHTML = this.getTime(this.shown);

    let currentDate = document.createElement("div");
    currentDate.setAttribute("class", "date");
    currentDate.setAttribute("id", "currentDate");
    currentDate.innerHTML = this.getDate(this.shown);

    currentTimestamp.appendChild(currentTime);
    currentTimestamp.appendChild(currentDate);

    let playButton = document.createElement("div");
    playButton.setAttribute("class", "controlButton");
    playButton.innerHTML = "&#9658";

    let forwardButton = document.createElement("div");
    forwardButton.setAttribute("class", "controlButton");
    forwardButton.innerHTML = ">>";

    let timeSlider = document.createElement("div");
    timeSlider.setAttribute("id", "timeSlider");

    let timeProgress = document.createElement("div");
    timeProgress.setAttribute("id", "timeProgress");

    let startTime = document.createElement("span");
    startTime.setAttribute("id", "startTime");
    startTime.innerHTML = this.getTime(this.first);

    let endTime = document.createElement("span");
    endTime.setAttribute("id", "endTime");
    endTime.innerHTML = this.getTime(this.last);

    let layers = document.createElement("div");
    layers.setAttribute("id", "layers");

    var list = document.createElement("ul");
    var title = document.createElement("li");
    title.innerHTML = "Ebenen";
    list.appendChild(title);

    timeSlider.appendChild(timeProgress);

    let options = ["1", "2"];

    for (var i = 0; i < options.length; i++) {
      // Create the list item:
      var item = document.createElement("li");
      item.setAttribute("class", "option");

      // Set its contents:
      item.appendChild(document.createTextNode(options[i]));
      let option = document.createElement("input");
      option.setAttribute("type", "checkbox");
      item.appendChild(option);

      // Add it to the list:
      list.appendChild(item);
    }

    layers.appendChild(list);

    let backwardsButton = document.createElement("div");
    backwardsButton.setAttribute("class", "controlButton");
    backwardsButton.innerHTML = "<<";

    let attribution = document.createElement("div");
    attribution.setAttribute("id", "attribution");
    attribution.innerHTML = this.attribution;

    //Append all Elements to the page
    let body = document.getElementsByTagName("body")[0];
    body.appendChild(controls);
    controls.appendChild(playButton);
    body.appendChild(currentTimestamp);
    controls.appendChild(backwardsButton);
    controls.appendChild(startTime);
    controls.appendChild(timeSlider);
    controls.appendChild(endTime);
    controls.appendChild(forwardButton);
    body.appendChild(layers);
    body.appendChild(attribution);

    //EventListener
    playButton.addEventListener("click", (event: CustomEvent) => {
      this.onPlay();
      if (this.animation == false) {
        playButton.innerHTML = "&#9658";
      } else {
        playButton.innerHTML = "||";
      }
    });

    forwardButton.addEventListener("click", (event: CustomEvent) => {
      this.onForward();
    });

    backwardsButton.addEventListener("click", (event: CustomEvent) => {
      this.onBackwards();
    });

    timeSlider.addEventListener("click", (event: CustomEvent) => {
      this.onPickedTimestamp(event);
    });

    let self = this;
    self.onChange(self.shown);

    window.onload = function() {
      //self.setTimestamp();
      console.log("init");
    };
  }

  //Converts unixtime to hh:mm
  getTime(pTimestamp) {
    let date = new Date(pTimestamp * 1000);
    let hour = date.getHours().toString();
    if (hour.toString().length < 2) {
      hour = "0" + hour;
    }

    let minute = date.getMinutes().toString();
    if (minute.toString().length < 2) {
      minute = "0" + minute;
    }

    return hour + ":" + minute;
  }

  //converts unixtime to ISO Date (MM-DD)
  getDate(pTimestamp) {
    let date = new Date(pTimestamp * 1000);
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    if (month.length < 2) {
      month = "0" + month;
    }
    if (day.length < 2) {
      day = "0" + day;
    }
    return month + "-" + day;
  }

  //jumps forward one timestamp
  onForward() {
    if (this.shown == this.last) {
      //Meldung
      let nextTimestamp = this.first;
      this.onChange(nextTimestamp);
    } else {
      let nextTimestamp = this.shown + this.interval;
      this.onChange(nextTimestamp);
      console.log("fw :", nextTimestamp, this.interval);
    }
  }

  //jumps back one timestamp
  onBackwards() {
    if (this.shown == this.first) {
      //Meldung
      let nextTimestamp = this.last;
      this.onChange(nextTimestamp);
    } else {
      let nextTimestamp = this.shown - this.interval;
      this.onChange(nextTimestamp);
    }
  }

  //starts or pauses animation
  onPlay() {
    if (this.animation == false) {
      this.animation, "play";
      this.play = setInterval(() => {
        this.onForward();
      }, 1000);
      this.animation = true;
    } else {
      clearInterval(this.play);
      this.animation = false;
    }
  }

  //function to find nearest available timestamp
  roundtoInterval(timestamp, interval, offset) {
    return Math.ceil((timestamp - offset) / interval) * interval + offset;
  }

  //sets new timestamp when clicked on the timeslider
  onPickedTimestamp(click) {
    let slider = document.getElementById("timeSlider");
    let controlBar = document.getElementById("controlBar");
    let offsetLeft = slider.offsetLeft + controlBar.offsetLeft;
    let posX = click.pageX - offsetLeft;
    let newTimestamp =
      this.first + (posX / slider.offsetWidth) * (this.last - this.first);
    let rounded = this.roundtoInterval(newTimestamp, this.interval, this.first);
    newTimestamp = rounded;
    console.log(newTimestamp, this.first, rounded);
    this.onChange(newTimestamp);
  }

  //uodates all visable timestamps as well as the timeslider
  setTimestamp(newTimestamp) {
    let self = this;
    self.shown = newTimestamp;

    document.getElementById("currentTime").innerHTML = this.getTime(this.shown);
    document.getElementById("currentDate").innerHTML = this.getDate(this.shown);

    let progressWidth =
      (
        (1 - (self.last - self.shown) / (self.last - self.first)) *
        100
      ).toString() + "%";

    document.getElementById("timeProgress").style.width = progressWidth;

    console.log(self.last, self.shown, progressWidth);
  }

  public setOnChange(pFunction) {
    this.onChange = pFunction;
  }
}
