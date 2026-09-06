def veri_pass(password):
    if len(password) < 8:
        raise ValueError("Le mot de passe doit contient au moins 8 caracteres ! ")
    for i in password:
        if i == " " :
            raise ValueError("Le mot de passe ne doit pas contenir des espaces !")
    

password = input("donner le mot de passe : ")
veri_pass(password)