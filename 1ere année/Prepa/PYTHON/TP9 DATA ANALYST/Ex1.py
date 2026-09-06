import math

class Cercle:
    def __init__(self,center,rayon):
        self.center = center
        self.rayon = rayon
    

    def aire(self):
        return math.pi * self.rayon ** 2
    
    def perimetre(self):
        return 2 * math.pi * self.rayon

    def testAppartenance(self,a):
        return True if math.sqrt(((self.center[0] - a[0]) ** 2) + ((self.center[1] - a[1]) ** 2)) <= self.rayon else False


center = (3,2)
rayon = 6
C1 = Cercle(center,rayon)

print(C1.aire())
print(C1.perimetre())
print(C1.testAppartenance((3,10)))