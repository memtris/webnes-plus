var locked = false;
navigator.serviceWorker.register('js/sw.js').catch(function(err) {console.log(err)});
var WebNES = function(nes) {
  this.nes = nes;
  try {
    this.audio = new webkitAudioContext();
  }
  catch(err) {
    this.audio = new AudioContext();
  }

  // Initialize screen context
  this.screen = document.getElementById('screen');
  this.canvasContext = this.screen.getContext('2d');
  this.canvasContext.fillStyle = 'black';
  this.canvasContext.imageSmoothingEnabled = false;
  this.canvasContext.fillRect(0, 0, 256, 240);
 // this.screen.width = this.screen.getBoundingClientRect().width;
//this.screen.height = this.screen.getBoundingClientRect().height;
 /*this.screen.width = this.screen.width * window.devicePixelRatio;
 this.screen.style.width = this.screen.width;
 this.screen.height = this.screen.height * window.devicePixelRatio;
 this.screen.style.height = this.screen.height;*/

  // Initialize framebuffer
  this.canvasData = this.canvasContext.getImageData(0, 0, 256, 240);
  for (var i = 3; i < this.canvasData.data.length - 3; i += 4) {
      this.canvasData.data[i] = 0xFF;
  }

  // Unlock audio
  var self = this;
  $(document).on('touchend', function() {/*
    var oscillator = self.audio.createOscillator();
 oscillator.frequency.value = 440;
 oscillator.connect(self.audio.destination);
 oscillator.start(0);
 oscillator.stop(.01);*/
    var source = self.audio.createBufferSource();
    source.buffer = self.audio.createBuffer(1, 1, 22050);
    source.connect(self.audio.destination);
    source.start(0);
    locked = true;
  });

  var intervalId = 0;
  var startEvent = 'touchstart';
  var stopEvent = 'touchend';
  this.screen.addEventListener(startEvent, function() {
    intervalId = setInterval(function() {
      $('#home').slideDown(250);
      $('#portrait_controls').fadeOut(250);
      $('#play').slideUp(250);
      $(document).unbind('touchmove');
      nes.stop();
      clearInterval(intervalId);
    }, 1000); }, false);
  this.screen.addEventListener(stopEvent, function() {
    clearInterval(intervalId);
  }, false); };

WebNES.prototype = {
  updateStatus: function(status) {
    document.getElementById("logs").innerHTML = ('JSNES: ' + status);
  },
  writeFrame: function(buffer, prevBuffer) {
    var data = this.canvasData.data;
    for (var i = 0; i < 256 * 240; i++) {
        var pixel = buffer[i];
        if (pixel != prevBuffer[i]) {
            var j = i * 4;
            data[j] = pixel & 0xFF;
            data[j + 1] = (pixel >> 8) & 0xFF;
            data[j + 2] = (pixel >> 16) & 0xFF;
            prevBuffer[i] = pixel;
        }
    }
    this.canvasContext.putImageData(this.canvasData, 0, 0);
  },
  writeAudio: function(leftSamples) {
    var nan = function(value) {
      return !isNaN(value);
    }
    var buffer = this.audio.createBuffer(1, leftSamples.length, 44100);
    buffer.getChannelData(0).set(leftSamples);
    var source = this.audio.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audio.destination);
    source.start(0);
  }
};
$("#settings").hide();
function viewHome() {
  $('#home').slideDown(250);
  $('#settings').slideUp(250);
}
function viewSettings() {
  $('#home').slideUp(250);
  $('#settings').slideDown(250);
}
function returnHome() {
    $('#home').fadeIn(500);
    $('#desktopLanding').hide();
  }
$(function() {
  h = window.screen.availHeight
  w = window.screen.availWidth
var skipDesktop;
var toggleLight = function() {
  $("body").removeClass("light");
  $("button").removeClass("light");
  $("li").removeClass("light");
  $("body").addClass("dark");
  $("button").addClass("dark");
  $("li").addClass("dark");
  localStorage.setItem("dark", true);
}
var toggleDark = function() {
    $("body").removeClass("dark");
  $("button").removeClass("dark");
  $("li").removeClass("dark");
  $("body").addClass("light");
  $("button").addClass("light");
  $("li").addClass("light");
  localStorage.setItem("dark", false);
}
window.codesToLoad = new Object();
function checkSettings() {
  var x = document.getElementById("theme");
  var y = document.getElementById("desktop");
  document.getElementById("codes").value = localStorage.getItem("codes");
  loadCodes();
  if(localStorage.getItem("desktop") === null) {
    localStorage.setItem("desktop", false);
    skipDesktop = false;
  }
  else {
    skipDesktop = (localStorage.getItem("desktop") === "true")
    y.innerHTML = localStorage.getItem("desktop").charAt(0).toUpperCase() + localStorage.getItem("desktop").slice(1)
  }
  if(localStorage.getItem("dark") === null) {
  localStorage.setItem("dark", false);
}
else {
  if (localStorage.getItem("dark") === "true") {
    toggleLight();
    x.innerHTML = "Dark";
  }
  else {
    toggleDark();
  }
}
}
checkSettings();
  if (h >= 640) {
    $("#portrait_up").css("top", "61%")
    $("#portrait_right").css("top", "70%")
    $("#portrait_down").css("top", "75%")
    $("#portrait_left").css("top", "70%")
    $("#portrait_select").css("top", "82%")
    $("#portrait_start").css("top", "82%")
    $("#portrait_B").css("top", "66%")
    $("#portrait_A").css("top", "66%")
  }

  if(!jQuery.browser.mobile && !skipDesktop){
    $('#settings').hide();
    $('#home').hide();
    $('#play').hide();
    $('#desktopLanding').fadeIn(500);
  }
  var db_alt;
function openDB() {
 var DBOpenRequest = window.indexedDB.open('webnes_roms');
 DBOpenRequest.onsuccess = function(e) {
   db_alt = DBOpenRequest.result;
 }
}

  var db = openDatabase('webnes', '1.0', 'Downloaded NES ROMs', 2 * 1024 * 1024);
  var nes = new JSNES({ 'ui': WebNES, fpsInterval: 2000, preferredFrameRate: 60, emulateSound: 1, region: 0});
  function renderItem(record) {
    var item = $('<li/>').text(record.name).attr('id', record.id);
    var alerted = false;
    var timeoutId = 0;
    var startEvent = 'touchstart';
    var stopEvent = 'touchend';
    item.bind(startEvent, function() {
      alerted = false;
      timeoutId = window.setTimeout(function() {
        alerted = true;
        if (!confirm("Delete this ROM?")) return;
        db.transaction(function(tx){
          tx.executeSql('DELETE FROM roms WHERE id = ?', [record.id], function() {
            localStorage.removeItem(record.storage);
            item.remove();
          });
        });
      }, 1000);
    }).on(stopEvent, function() {
      clearTimeout(timeoutId);
      if (alerted) return;
      $('#home').slideUp(250);
      $('#play').slideDown(250);
      $('#portrait_controls').slideDown(250);
      if (nes.loadedId !== record.id) {
        var rom = localStorage.getItem(record.storage);
        nes.loadRom(rom);
        nes.loadCodes(window.codesToLoad);
        nes.setFramerate(60);
      nes.setRegion(0);
        nes.loadedId = record.id;
        // not very good but it'll do as long as no one plays 3000 games in one go
        
        var checksum = new Uint32Array([CRC32.bstr(rom.slice(16, rom.length))])[0].toString(16).toUpperCase();
        $.ajaxSetup({ async: true});
        $.get('NstDatabase.xml', function(data) {
          $(data.getElementsByTagName('game')).each(function(element, value) {
            var toBeChecked = $(value.getElementsByTagName('cartridge')[0]).attr('crc');
            if(toBeChecked === checksum) {
              if($(value.getElementsByTagName('cartridge')[0]).attr('system') === "NES-PAL"|| $(value.getElementsByTagName('cartridge')[0]).attr('system') === "NES-PAL-B") {
                nes.setFramerate(50);
                nes.setRegion(1);
                nes.reloadRom();
                nes.start();
              }
            }
          });
        });
      }
      $(document).on('touchmove', function(e) {
        e.preventDefault();
      });
      nes.start();
      document.getElementById("loadedGame").innerHTML = "Currently loaded game: " + record.name;
    });
    return item;
  };

  function addRom(name, url) {
    $.ajax({
      type: 'GET',
      url: url,
      timeout: 3000,
      mimeType: 'text/plain; charset=x-user-defined',
      success: function(data) {
        var key = Math.random().toString(36).slice(2);
        localStorage.setItem(key, data);
        db.transaction(function(tx){
          tx.executeSql('INSERT INTO roms (id, name, storage) VALUES (?, ?, ?)', [null, name, key]);
          tx.executeSql('SELECT * FROM roms WHERE storage = ?', [key], function(tx, result) {
            $('#scroll ul').append(renderItem(result.rows.item(0)));
          });
        });
      }
    });
  }

  db.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS roms (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, storage TEXT)');
    tx.executeSql('SELECT * FROM roms', [], function(tx, result) {
      for (var i = 0; i < result.rows.length; i++) {
        $('#scroll ul').append(renderItem(result.rows.item(i)));
      }
      if (result.rows.length == 0) {
        addRom('Croom', 'roms/croom.nes');
        addRom('Tetramino', 'roms/lj65.nes');
        addRom('Galaxy Patrol', 'roms/galaxy.nes');
        addRom('Fighter F-8000', 'roms/fighter_f8000.nes');
        addRom('BoxBoy', 'roms/BOXBOY.nes');
      }
    });
  });  

  $('#addROM').click(function() {
    Dropbox.choose({
      success: function(files) {
        files.forEach(function(file) {
          addRom(file.name.replace('.nes', ''), file.link);
        });
      },
      linkType: "direct",
      multiselect: true,
      extensions: ['.nes']
    });
  });
/*document.addEventListener('keydown', function(event) {
    if(event.keyCode == 65) {
        input.setButton(6,true);
    }
    else if(event.keyCode == 68) {
        input.setButton(7,true);
    }
    else if(event.keyCode == 83) {
      input.setButton(5,true);
    }
    else if(event.keyCode == 87) {
      input.setButton(4,true);
    }
    else if(event.keyCode == 72) {
      input.setButton(0,true);
    }
    else if(event.keyCode == 71) {
      input.setButton(1, true);
    }
    else if(event.keyCode == 9) {
      input.setButton(2, true);
    }
    else if(event.keyCode == 13) {
      input.setButton(3, true);
    }
});
document.addEventListener('keyup', function(event) {
    if(event.keyCode == 65) {
        input.setButton(6,false);
    }
    else if(event.keyCode == 68) {
        input.setButton(7,false);
    }
    else if(event.keyCode == 83) {
      input.setButton(5,false);
    }
    else if(event.keyCode == 87) {
      input.setButton(4,false);
    }
    else if(event.keyCode == 72) {
      input.setButton(0,false);
    }
    else if(event.keyCode == 71) {
      input.setButton(1, false);
    }
    else if(event.keyCode == 9) {
      input.setButton(2, false);
    }
    else if(event.keyCode == 13) {
      input.setButton(3, false);
    }
});*/
function GGencode(code) {
  var codeArray = code.split("");
  var output = new Object();
  var charKey = "APZLGITYEOXUKSVN";
  var codeBits = new Array(32);
  var encodeUsed;
  var encoding6 = [0, 5, 6, 7, 15, 1, 2, 3, 23, 16, 17, 18, 19, 8, 9, 10, 11, 20, 21, 22, 4, 12, 13, 14]
  var encoding8 = [0, 5, 6, 7, 15, 1, 2, 3, 23, 16, 17, 18, 19, 8, 9, 10, 11, 20, 21, 22, 28, 12, 13, 14, 24, 29, 30, 31, 4, 25, 26, 27]
  var length = code.length;
  var currentValue = 0;
  var validCode = true;
  if(code.length === 6) {
    output.hasKey = false;
    encodeUsed = encoding6;
  }
  else if(code.length === 8) {
    output.hasKey = true;
    encodeUsed = encoding8;
  }
  else {
    return null;
  }
  codeArray.forEach((item, index) => {
    if(validCode) {
    if(charKey.indexOf(item) !== -1) {
      var keyNumber = charKey.indexOf(item);
      codeBits[encodeUsed[currentValue]] = + ((keyNumber & 8) > 0);
      codeBits[encodeUsed[currentValue + 1]] = + ((keyNumber & 4) > 0);
      codeBits[encodeUsed[currentValue + 2]] = + ((keyNumber & 2) > 0);
      codeBits[encodeUsed[currentValue + 3]] = + ((keyNumber & 1) > 0);
      currentValue += 4;
    }
    else {
      validCode = false;
    }
    }
  });
  if(validCode) {
  output.address = 0;
  output.value = 0;
  output.compare = 0;
  codeBits.forEach((item, index) => {
    if(index < 8) {
      output.value = (output.value << 1) + item;
    }
    else if (index < 23) {
      output.address = (output.address << 1) + item;
    }
    else if (index > 23) {
      output.compare = (output.compare << 1) + item;
    }
  })
  return output;
  }
  else {
    return null;
  }
}
function saveCodes() {
localStorage.setItem('codes', document.getElementById("codes").value);
loadCodes();
}
function loadCodes() {
  window.codesToLoad = Object();
var x = "";
document.getElementById("codes").value.split('\n').forEach((item) => {
  try {
  var code = GGencode(item);
   window.codesToLoad[code.address] = [code.value, code.hasKey, code.compare];
  x += " " + item;
  }
  catch(error) {
  }
  });
document.getElementById("validCodes").innerHTML = "Loaded codes:" + x;
if(nes) {
nes.loadCodes(window.codesToLoad);
}
}
$('#saveCodes').click(() => {
  saveCodes()
});
$("#theme").on('touchstart', function(m) {
  var x = document.getElementById("theme");
  if(x.innerHTML === "Dark") {
  toggleDark();
  x.innerHTML = "Light";
  }
  else {
  toggleLight();
    x.innerHTML = "Dark";
  }
});
$("#desktop").on('touchstart', function(m) {
  var x = document.getElementById("desktop");
  if(x.innerHTML === "False") {
  localStorage.setItem("desktop", true);
  x.innerHTML = "True";
  }
  else {
  localStorage.setItem("desktop", false);
    x.innerHTML = "False";
  }
});
document.getElementById("reset").onclick = function() {
  nes.stop();
  nes.reset();
  nes.reloadRom();
  nes.loadCodes(window.codesToLoad);
  nes.start();
}
  var input = nes.input;
  var buttons = [ '#portrait_A', '#portrait_B', '#portrait_select','#portrait_start', '#portrait_up', '#portrait_down', '#portrait_left', '#portrait_right' ];
  var startEvent = 'touchstart';
  var stopEvent = 'touchend';
  buttons.forEach(function(selector) {
    $(selector).on(startEvent, function(m) {
      m.preventDefault();
      input.setButton(buttons.indexOf(selector), true);
      $(selector).addClass("active");
    }).on(stopEvent, function(m) {
      m.preventDefault();
      input.setButton(buttons.indexOf(selector), false);
      $(selector).removeClass("active");
    });
  });
});