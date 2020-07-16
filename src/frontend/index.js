// const socket = io("https://redsweater.azurewebsites.net/");
const socket = io("http://0.0.0.0");
var email = "felix.chen@ibm.com"
var user = {}
var friends = {}

socket.on("connect", () => {});
socket.on("friendNewItem", (friendEmail, itemID, item) => {
    addToFriendShoppingList(friendEmail, itemID, item)
})

socket.on("friendClaimed", (email, itemID) => {
    console.log(itemID, "claimed")
    // If this is my item, I update their claim
    let myItem = $(`#myList div[rowitemid="${itemID}"] div`)[3]
    if (myItem) {
        myItem.innerHTML = email
    } else {
        // This is one of my friends items, delete
        $(`#friendLists div[rowitemid="${itemID}"]`).remove()
    }
})

socket.on("render", (response) => {
    console.log("I've been asked to render")
    user = response.user
    friends = response.friends
    createMyShoppingList(user.shoppinglist)
    createFriendShoppinglists(friends)
    createClaimedForFriend(friends)
})

$(function () {
    $(".tab").click(function () {
        // Tabs
        $(".tabcontent").hide();
        $("#" + $(this).attr("tab")).show();
    });

    $("#navigation-menu-m6ibyfeacg .tab").click(function () {
        // Close nav on tab click
        $("#hamburger").click();
    });

    $("#login").click(function () {
        // Login handler
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
                createClaimedForFriend(friends)
            } else {
                alert("Bad login")
            }
        })
    })

    $("#addItem").click(function () {
        // Add new item on my list
        let name = $("#addItemName").val()
        let quantity = $("#addItemQuantity").val()
        let notes = $("#addItemNotes").val()
        let item = {
            name,
            quantity,
            notes
        }

        socket.emit("addItemAttempt", email, item, function (response) {
            addItemToMyShoppingList(response.itemID, item)
        })
    })

    $("#addFriend").click(function () {
        let friendEmail = $("#addFriendEmail").val()
        socket.emit("addFriendAttempt", email, friendEmail, function (response) {
            user = response.user
            friends = response.friends
            createMyShoppingList(user.shoppinglist)
            createFriendShoppinglists(friends)
            createClaimedForFriend(friends)
        })
    })
});

const createMyShoppingList = (items) => {
    // INIT create my shopping list from DB
    let domString = ``

    for (var itemID in items) {
        item = items[itemID]

        domString = domString + `
        <div class="bx--structured-list-row" rowitemid = "${itemID}">
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
    $("#myShoppingList").empty().append(domString)
}

const createFriendShoppinglists = (friends) => {
    $("#friendLists").empty()
    // INIT create friends shopping lists from DB
    for (var friendEmail in friends) {

        let itemString = ``
        let items = friends[friendEmail].shoppinglist

        for (var itemID in items) {
            item = items[itemID]

            if (item.in_list == "") {
                itemString = itemString + `
                <div class="bx--structured-list-row" rowitemid = "${itemID}">
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
                            bx--tooltip--align-center bx--btn--sm claim"
                            itemID= ${itemID}
                            friendEmail = ${friendEmail}>
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
                        <div class="bx--structured-list-th">Add to My List</div>
                    </div>
                </div>
                <div class="bx--structured-list-tbody" friendList="${friendEmail}">
                ${itemString}
                </div>
            </section>
        </div>`

        $("#friendLists").append(domString)
        setListeners()
    }
}

const createClaimedForFriend = (friends) => {
    // INIT create added for friends shopping lists from DB

    $("#claimedForFriendList").empty()
    for (var friendEmail in friends) {

        let itemString = ``
        let items = friends[friendEmail].shoppinglist

        for (var itemID in items) {
            item = items[itemID]

            if (item.in_list == email) {
                let checked = ""
                if (item.purchase_by == email) {
                    checked = "checked"
                }

                itemString = itemString + `
                <div class="bx--structured-list-row" >
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
                        <div class="bx--form-item bx--checkbox-wrapper">
                            <input id="bx--checkbox-${itemID}" class="bx--checkbox" type="checkbox"
                                value="new"
                                name="checkbox" 
                                purchaseitemid="${itemID}"
                                purchasefriendemail="${friendEmail}" ${checked}/>
                            <label for="bx--checkbox-${itemID}" class="bx--checkbox-label"></label>
                        </div>
                    </div>
                </div>`
            }
        }

        let domString = `
            <div class="bx--col-sm-4 bx--col-lg-12 bx--col-padding">
                <h4>${friendEmail}</h4>
                <section class="bx--structured-list">
                    <div class="bx--structured-list-thead">
                        <div class="bx--structured-list-row
                            bx--structured-list-row--header-row">
                            <div class="bx--structured-list-th">Item</div>
                            <div class="bx--structured-list-th">Quantity</div>
                            <div class="bx--structured-list-th">Notes</div>
                            <div class="bx--structured-list-th">Purchased</div>
                        </div>
                    </div>
                    <div class="bx--structured-list-tbody" claimsfor=${friendEmail}>
                        ${itemString}
                    </div>
                </section>
            </div>`

        $("#claimedForFriendList").append(domString)
        setListeners()
    }
}


const addItemToMyShoppingList = (itemID, item) => {
    // Add item to my shopping list
    domString = `
    <div class="bx--structured-list-row" rowitemid = "${itemID}">
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

const addToFriendShoppingList = (friendEmail, itemID, item) => {
    // Friend added a new item, sync up on friends tab
    itemString = `<div class="bx--structured-list-row" rowitemid = "${itemID}">
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
                        bx--tooltip--align-center bx--btn--sm claim"
                        itemID= ${itemID}
                        friendEmail = ${friendEmail}>
                        <span class="bx--assistive-text">Add</span>
                        <svg focusable="false" preserveAspectRatio="xMidYMid meet"
                            style="will-change: transform;" xmlns="http://www.w3.org/2000/svg"
                            class="bx--btn__icon" width="16" height="16" viewBox="0 0 16 16"
                            aria-hidden="true"><path d="M9 7L9 3 7 3 7 7 3 7 3 9 7 9 7 13 9 13 9
                                9 13 9 13 7z"></path></svg>
                    </button>
                </div>
            </div>`


    $(`div[friendList="${friendEmail}"]`).append(itemString)
    setListeners()
}

const setListeners = () => {
    // Add this item to my list for friend
    $(".claim").click(function () {
        let friendEmail = $(this).attr("friendEmail")
        let itemID = $(this).attr("itemID")

        socket.emit("claimForFriendAttempt", email, friendEmail, itemID, function (response) {
            user = response.user
            friends = response.friends
            createMyShoppingList(user.shoppinglist)
            createFriendShoppinglists(friends)
            createClaimedForFriend(friends)
        })

        // Remove this element from my friend shopping list dom
        $(this).closest(".bx--structured-list-row").remove()
    })

    // WHY IS THIS FIRING THREE TIMES???
    $(".bx--checkbox").change(function () {
        if (this.checked) {
            let itemID = $(this).attr("purchaseitemid")
            let friendEmail = $(this).attr("purchasefriendemail")
            socket.emit("purchaseForFriendAttempt", email, friendEmail, itemID, function (response) {})
        }
    })

}