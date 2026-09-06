class Cours:
    def __init__(self,nom,max_students,student):
        self.__nom = nom
        self.__max_students = max_students
        self.__student = student
    
    def add_s(self,student):
        if len(self.__student) < self.__max_students : 
            self.__student.append(student)
        else:
            print("La classe est saturee !")
    def get_average_grade(self):
        somme = 0
        for i in self.__student:
            somme += i.grade
        
        return somme/len(self.__student)

    @property
    def student(self):
        return self.__student

class Student:
    def __init__(self,nom,age,grade):
        if age < 0 :
            raise ValueError("l'age doit etre positif !")
        if grade < 0 or grade > 20 :
             raise ValueError("la note doit etre entre 0 et 20 !")
        self.__nom = nom
        self.__age = age
        self.__grade = grade

    @property
    def nom(self):
        return self.__nom 
    
    @property
    def age(self):
        return self.__age

    @property 
    def grade(self):
        return self.__grade
        
    @nom.setter
    def nom(self,value):
        self.__nom = value
    
    @age.setter
    def age(self,value):
        self.__age = value

    @grade.setter 
    def grade(self,value):
        self.__grade = value
    

list_s = [
    Student("Abdenour",20,16),
    Student("Mohamed",19,19)
]


C1 = Cours("francais",2,list_s) 
C1.add_s(Student("Loofi",13,20))
print(C1.get_average_grade())