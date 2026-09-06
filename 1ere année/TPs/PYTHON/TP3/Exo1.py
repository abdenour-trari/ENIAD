# +++++++++++++++++++++++++++
  
def cube(x):
    return x*x*x

def volume_Sphere(r):
    return (4*3.14 * cube(r))/3


r = float(input("Donner le rayon du sphére : "))
print(f"le volume du sphére est : {volume_Sphere(r)}")
