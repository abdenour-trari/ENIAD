def n_j():
    pr = []
    pr_j = []
    for i in range(51):
        if i % 2 != 0 :
            pr.append(i)
    for i in range(1,len(pr)):
        if (pr[i] - pr[i-1]) == 2:
            pr_j.append((pr[i-1] ,pr[i]))
    return pr_j

print(n_j())