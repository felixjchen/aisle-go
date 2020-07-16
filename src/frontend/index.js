// const socket = io("https://redsweater.azurewebsites.net/");
const socket = io("http://0.0.0.0");
var email = "felix.chen@ibm.com"
var user = {}
var friends = {}

socket.on("connect", () => {
    // either with send()
    // socket.send("Hello!");

});

// handle the event sent with socket.send()
// socket.on("message", (data) => {
//     console.log(data);
// });

// // handle the event sent with socket.emit()
// socket.on("greetings", (elem1, elem2, elem3) => {
//     console.log(elem1, elem2, elem3);
// });

$(function () {
    $(".tab").click(function () {
        $(".tabcontent").hide();
        $("#" + $(this).attr("tab")).show();
    });

    $("#navigation-menu-m6ibyfeacg .tab").click(function () {
        $("#hamburger").click();
    });

    $("#login").click(function () {
        let signInEmail = $('#email').val().toLowerCase()
        let password = $('#password').val()
        socket.emit("loginAttempt", signInEmail, password, function (response) {

            // Want true for login success, false means some sort of error
            console.log('Callback for login with data:', response);

            if (response.status) {
                $("#account").text(signInEmail)
                $("#loginPane").hide()
                $("#application").show()
                email = signInEmail
                user = response.user
                friends = response.friends

                createMyShoppingList(user.shoppinglist)
            }
        })
    })

    $("#addItem").click(function () {
        let name = $("#addItemName").val()
        let quantity = $("#addItemQuantity").val()
        let notes = $("#addItemNotes").val()
        let item = {
            name,
            quantity,
            notes
        }

        socket.emit("addItemAttempt", email, item, function (response) {

            // Want true for login success, false means some sort of error
            console.log('Callback for login with data:', response);
        })

    })
});

const createMyShoppingList = (items) => {
    let domString = ``

    for (var itemID in items) {
        item = items[itemID]

        domString = domString + `
        <div class="bx--structured-list-row">
            <div class="bx--structured-list-td
                bx--structured-list-content--nowrap">
                ${item.name}
            </div>
            <div class="bx--structured-list-td">
                ${item.quantity}
            </div>
            <div class="bx--structured-list-td">
                ${item.notes}
            </div>
            <div class="bx--structured-list-td">
                ${item.in_list}
            </div>
            <div class="bx--structured-list-td">
                ${item.purchase_by}
            </div>
        </div>`
    }
    $("#myShoppingList").append(domString)
}