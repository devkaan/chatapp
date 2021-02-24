var socket = null;
var isme = false;
var asd = 1;
$(document).ready(function () {
  socket = io();
  $('#comment').keydown(function (e) {
    var key = e.keyCode;
    if (key == 13) {
      sendmsg()
    }
    else {
      if ($('#alertbox').css('display') == 'none') {
        $('#alertbox').html('<h6 class="alert alert-warning">You should write a message</h6>');
        $('#alertbox').show(500).delay(1000).hide(500);
      }
    }
  })
  $("#sendbtn").click(function () {
    sendmsg()
  });

  socket.on('refresh feed', ({ text, user }) => {
    var dt = new Date();
    var time = (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ":" + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes());

    var audio = {};
    var audioElement = document.createElement('audio');
    audioElement.setAttribute('src', '/sounds/bellsound.mp3');

    isTabFocused = document.hasFocus();
    console.log('tab status', isTabFocused);
    if (isme) {
      text = '<div class="message me"><div class="bubble"><div class="username">' + user + '</div>' + text + '</div><div class="time">' + time + '</div></div>';
    }
    else {
      if (!isTabFocused) {
        audioElement.play();
      }
      text = '<div class="message"><div class="bubble"><div class="username">' + user + '</div>' + text + '</div><div class="time">' + time + '</div></div>';
    }
    isme = false
    $("#message-content").append(text);

    // console.log('appended div =>', text);
    lastheight = $(".message").last().height();
    console.log('last =>', (lastheight * asd * 2));
    $('#message-content').animate({ scrollTop: (lastheight * asd * 2) }, 'fast');

    asd++;
    $('#comment').val('');
  });
  socket.on('not logged', () => {
    window.location.href = '/'
  })
});

function sendmsg() {
  var msg = $("#comment").val();
  msg = msg.trim();
  if (msg.length > 0) {
    socket.emit('me', { 'text': msg });
    isme = true
    $('#sendbtn').hide(200);
  }
  else {
    if ($('#alertbox').css('display') == 'none') {
      $('#alertbox').html('<h6 class="alert alert-warning">You should write a message</h6>');
      $('#alertbox').show(500).delay(1000).hide(500);
    }
  }
}

// $("#message-content").on('click', () => {
// 	isfocused = $('#comment').is(':focus');
// 	if (!isfocused) {
// 		$('#comment').focus();
// 	}
// })

$('#comment').on('keyup', () => {
  if ($('#sendbtn').css('display') == 'block') {
    if ($('#comment').val().length <= 0) {
      $('#sendbtn').hide(200)
    }
  } else {
    if ($('#comment').val().length > 0) {
      $('#sendbtn').show(200)
    } else {
      $('#sendbtn').hide(200)
    }
  }
})