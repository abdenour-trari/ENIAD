from ctypes.wintypes import FLOAT
from pickle import STRING
from sys import exec_prefix

def switch(category):
    if category == "A" : return 7/100
    elif category == "B" : return 20/100
    elif category == "C" : return 25/100

def verify_category(category):
    if category == "A" or category == "B" or category == "C" :
        return True
    else:
        return False

def verify_price(price):

    try:
        price = float(price)
        return True
    except ValueError:
        print("Please enter a number")
        return False


category = input("Entre your product's category : ")
while verify_category(category) is False:
    category = input("You must give an existed category : ")

price = input("Enter your product price : ")
while verify_price(price) is False:
    price = input("")

ttc = float(price) * switch(category)

print(f"The total price is : {ttc}")





