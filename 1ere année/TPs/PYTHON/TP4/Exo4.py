def print_multiple(number):
    for i in range(20):
        n = (number * i) % 3
        star = " *" if n == 0 else ""
        print(f"{number} * {i} = {number * i}{star}")

print_multiple(7)
