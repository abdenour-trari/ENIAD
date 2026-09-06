def fibonacci(n):
    if n < 0 :
        raise ValueError("Le nombre doit etre > 0")
    
    i = 1
    a,b = 0,1
    while i < n :
        print(a , end=" ")
        tmp = a+b
        a = b
        b = tmp 
        i += 1

        


fibonacci(9)