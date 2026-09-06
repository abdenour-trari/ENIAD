class MyString:
    def __init__(self,str):
        self.__str = str

    def pop(self,index):
        new_s = self.__str[:index]
        new_s += self.__str[index+1:]
        return new_s
    def append(self,str2):
        return self.__str + str2
    

s1 = MyString("Hello")
s2 = MyString("Bonjour")

print(s1.append(" World !"))
print(s2.pop(2))
