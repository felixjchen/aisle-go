import json


def jsonLoad(filePath='../db/history.json'):
    with open('db/history.json', 'r') as f:
        data = json.load(f)
    return data


def getShoppingList(data, user):
    for usr in data["users"]:
        if usr == user:
            dataList = data["users"][usr]["shoppinglist"]
            shoppingList = []
            for item in dataList:
                if not dataList[item]["purchase_by"]:
                    shoppingList.append(dataList[item]["name"])
            return shoppingList
    return None


def getPruchaseHistory(data, pruchaser, pruchasedFor):
    purchases, allPurchases = [], []
    for usr in data["users"]:
        datalist = data["users"][usr]["shoppinglist"]
        for item in datalist:
            if usr == pruchasedFor and datalist[item]["purchase_by"] == pruchaser:
                purchases.append(datalist[item]["name"])
            if datalist[item]["purchase_by"] == pruchaser:
                allPurchases.append(datalist[item]["name"])
    return purchases, allPurchases


def getPurchasesFor(purchaser, asker):
    data = jsonLoad()
    itemlib, purchases, allPurchases = {}, {}, {}
    countA, countB, countC = 0, 0, 0
    shoppingList = getShoppingList(data, asker)
    purchaseHistory = getPruchaseHistory(data, purchaser, asker)

    for item in shoppingList:
        if item not in itemlib:
            itemlib[item] = 1
            countA = countA + 1
        else:
            itemlib[item] = itemlib[item] + 1
            countA = countA + 1

    for item in purchaseHistory[0]:
        if item not in purchases:
            purchases[item] = 1
            countB = countB + 1
        else:
            purchases[item] = purchases[item] + 1
            countB = countB + 1

    for item in purchaseHistory[1]:
        if item not in allPurchases:
            allPurchases[item] = 1
            countC = countC + 1
        else:
            allPurchases[item] = allPurchases[item] + 1
            countC = countC + 1

    if countA == 0:
        countA = 1
    if countB == 0:
        countB = 1
    if countC == 0:
        countC = 1

    probItem = {}
    for item in purchases:
        if item not in probItem:
            probItem[item] = 0.6 * purchases[item] / countB

    for item in allPurchases:
        if item not in probItem:
            probItem[item] = 0.4 * allPurchases[item] / countC
        else:
            probItem[item] = probItem[item] + \
                (0.4 * allPurchases[item] / countC)

    assignProb = {}
    for item in itemlib:
        if item in probItem:
            assignProb[item] = probItem[item]

    return probItem, assignProb


if __name__ == "__main__":
    purchaser = "nadiya.stakhyra@ibm.com"
    asker = "felix.chen@ibm.com"
    probItem, assignProb = getPurchasesFor(purchaser, asker)
    print("All the items purchased by {}: {}".format(purchaser, probItem))
    print("Prob for the items on {} list: {}".format(asker, assignProb))
