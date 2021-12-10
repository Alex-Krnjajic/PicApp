(function () {
  var width = 0; // We will scale the photo width to this
  var height = 0; // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;
  var front = true;

  error = document.getElementById("error");

  var constraints = {
    video: {
      width: {
        min: 1280,
        max: 2560,
      },
      height: {
        min: 720,
        max: 1440,
      },
      facingMode: "user",
    },
    audio: false,
  };
  let currentStream;

  function stopMediaTracks(stream) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  function sendImage() {
    var data = canvas.toDataURL("image/png");
    var d = new Date();
    var name = d.toISOString();

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.response);
      }
    };

    xhttp.open("POST", "database.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    console.log(xhttp.getReq);
    xhttp.send("q=" + data + "&name=" + name);
  }

  function changeCamera() {
    if (typeof currentStream !== "undefined") {
      stopMediaTracks(currentStream);
    }
    if (front === true) {
      constraints = {
        video: {
          facingMode: "environment",
        },
        audio: false,
      };
      front = false;
    } else {
      constraints = {
        video: {
          facingMode: "user",
        },
        audio: false,
      };
      front = true;
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        currentStream = stream;
        video.srcObject = stream;
        updateSize();
        video.play();
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(gotDevices)
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });
  }

  function updateSize() {
    if (!streaming) {
      height = video.videoHeight;

      width = video.videoWidth;

      // Firefox currently has a bug where the height can't be read from
      // the video, so we will make assumptions if this happens.

      if (isNaN(height)) {
        height = width / (4 / 3);
      }

      video.setAttribute("width", width);
      video.setAttribute("height", height);
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
      streaming = true;
    }
  }

  function gotDevices(mediaDevices) {
    selectcamera = document.getElementById("camera");
    selectcamera.innerHTML = "";
    selectcamera.appendChild(document.createElement("option"));
    let count = 1;
    mediaDevices.forEach((mediaDevice) => {
      if (mediaDevice.kind === "videoinput") {
        const option = document.createElement("option");
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Camera ${count++}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        selectcamera.appendChild(option);
      }
    });
  }

  function startup() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");
    save = document.getElementById("save");
    changecamera = document.getElementById("changecamera");
    error = document.getElementById("error").innerHTML;

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        currentStream = stream;
        video.srcObject = stream;
        video.play();
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(gotDevices)
      .catch(function (err) {
        console.log("An error occurred: " + err);
      });

    video.addEventListener(
      "canplay",
      function (ev) {
        updateSize();
      },
      false
    );

    startbutton.addEventListener(
      "click",
      function (ev) {
        takepicture();
        ev.preventDefault();
      },
      false
    );

    save.addEventListener(
      "click",
      function (ev) {
        sendImage();
        ev.preventDefault;
      },
      false
    );

    changecamera.addEventListener(
      "click",
      function (ev) {
        changeCamera();
        ev.preventDefault;
      },
      false
    );

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      var data = canvas.toDataURL("image/png");
      //console.log(data);
      photo.setAttribute("src", data);
    } else {
      clearphoto();
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener("load", startup, false);
})();
