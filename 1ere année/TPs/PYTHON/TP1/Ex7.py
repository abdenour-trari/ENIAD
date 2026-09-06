def verify_integer(N):
    if N < 100 or N < 0 :
        return False
    return True

def sub_number(A):
    list_values = []
    while A / 10 != 0:
        R = A % 10
        A = A // 10
        list_values.append(int(R))
    return list_values

def sum_numbers(list_numbers):
    summ = 0
    for i in range(len(list_numbers)):
        summ = summ + list_numbers[i]
    return summ

def append_sum(summ , list_append):
    if 10 > sum_numbers(sub_number(summ)) > 0 :
        list_append.append(sum_numbers(sub_number(summ)))
    else:
        new_list = sub_number(summ)
        sum_numbers(new_list)
        append_sum(sum_numbers(new_list), list_append)

    return list_append

def paste_number(list_to_paste):
    i = len(list_to_paste)
    A = 0
    while i > 0 :
        A = A + list_to_paste[i-1]
        i = i - 1
        if i == 0 :
            break
        else:
            A = A * 10

    return A



N = int(input("Enter a number: "))

while verify_integer(int(N)) is False:
    N = int(input("Enter a number: "))

print(sub_number(N))
print(sum_numbers(sub_number(N)))
pasted_list = append_sum(sum_numbers(sub_number(N)), sub_number(N))
print(pasted_list)
print(paste_number(pasted_list))
