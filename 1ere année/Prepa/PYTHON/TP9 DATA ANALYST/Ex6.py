class Forme:
    def __init__(self,lo,la):
        self._longueur = lo
        self._largeur = la
    
    @property
    def longueur(self):
        return self._longueur
    
    @property
    def largueur(self):
        return self._largeur
    
    @largueur.setter
    def largueur(self,la):
        self._largeur = la

    @longueur.setter
    def longueur(self,lo):
        self._longueur = lo
    
class Triangle(Forme) :
    def __init__(self,lo,la):
        super().__init__(lo,la)
        

    def aire(self):
        return (self._largeur * self._longueur)/2

class Rectangle(Forme) :
    def __init__(self,lo,la):
        super().__init__(lo,la)
    
    def aire(self):
        return self._largeur * self._longueur


class Cube(Forme) :
    def __init__(self,lo,la,h):
        super().__init__(lo,la)
        self._hauteur = h

    def volume(self):
        return self._largeur * self._longueur * self._hauteur
    
f1 = Triangle(6,2)
f2 = Rectangle(4,10)
f3 = Cube(10,10,7)
print(f1.aire())
print(f2.aire())
print(f3.volume())

    