// const socket = io("https://redsweater.azurewebsites.net/");
const socket = io("http://0.0.0.0");

socket.on("connect", () => {
    // either with send()
    // socket.send("Hello!");

});

// handle the event sent with socket.send()
socket.on("message", (data) => {
    console.log(data);
});

// handle the event sent with socket.emit()
socket.on("greetings", (elem1, elem2, elem3) => {
    console.log(elem1, elem2, elem3);
});

$(function () {
    $(".tab").click(function () {
        $(".tabcontent").hide();
        $("#" + $(this).attr("tab")).show();
    });

    $("#navigation-menu-m6ibyfeacg .tab").click(function () {
        $("#hamburger").click();
    });

    $("#login").click(function () {
        let email = $('#email').val().toLowerCase()
        let password = $('#password').val()
        socket.emit("loginAttempt", email, password, function (response) {

            // Want true for login success, false means some sort of error
            console.log('Callback called with data:', response);

            if (response) {
                $("#loginPane").hide()
                $("#application").show()
            }

        })
    })
});