def email(email):
    new_mail = ""
    i = 0
    while email[i] != " " :
        i += 1
    i += 1
    while email[i] != " " :
        new_mail += email[i]
        i += 1
    mail = new_mail.split('@')
    
    return mail[1]

print(email('From stephen.marquard@uct.ac.za Sat Jan 5 09:14:16 2008')) 