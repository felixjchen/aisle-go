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
            console.log('Login with data:', response);

            if (response.status) {
                $("#account").text(signInEmail)
                $("#loginPane").hide()
                $("#application").show()
                email = signInEmail
                user = response.user
                friends = response.friends

                createMyShoppingList(user.shoppinglist)
                createFriendShoppinglists(friends)
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
            addItemToShoppingList(item)
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

const addItemToShoppingList = (item) => {
    domString = `
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
        </div>
        <div class="bx--structured-list-td">
        </div>
    </div>`
    $("#myShoppingList").append(domString)
}

const createFriendShoppinglists = (friends) => {

    for (var friendEmail in friends) {

        let itemString = ``
        let items = friends[friendEmail].shoppinglist

        for (var itemID in items) {
            item = items[itemID]

            itemString = itemString + `<div class="bx--structured-list-row">
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
                    <button
                        class="bx--btn bx--btn--secondary bx--btn--icon-only
                        bx--tooltip__trigger bx--tooltip--a11y bx--tooltip--bottom
                        bx--tooltip--align-center bx--btn--sm">
                        <span class="bx--assistive-text">Add</span>
                        <svg focusable="false" preserveAspectRatio="xMidYMid meet"
                            style="will-change: transform;" xmlns="http://www.w3.org/2000/svg"
                            class="bx--btn__icon" width="16" height="16" viewBox="0 0 16 16"
                            aria-hidden="true"><path d="M9 7L9 3 7 3 7 7 3 7 3 9 7 9 7 13 9 13 9
                                9 13 9 13 7z"></path></svg>
                    </button>
                </div>
            </div>`
        }

        let domString = `
        <div class="bx--col-sm-4 bx--col-lg-6 bx--col-padding">
            <h4>${friendEmail}</h4>
            <section class="bx--structured-list">
                <div class="bx--structured-list-thead">
                    <div class="bx--structured-list-row
                        bx--structured-list-row--header-row">
                        <div class="bx--structured-list-th">Item</div>
                        <div class="bx--structured-list-th">Quantity</div>
                        <div class="bx--structured-list-th">Notes</div>
                        <div class="bx--structured-list-th">Add to my List</div>
                    </div>
                </div>
                <div class="bx--structured-list-tbody">
                ${itemString}
                </div>
            </section>
        </div>`

        $("#friendLists").append(domString)

    }
}