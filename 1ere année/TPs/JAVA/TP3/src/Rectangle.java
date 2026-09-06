public class Rectangle {
    float longueur , largeur ;
    String nom ;

    public Rectangle() {
        this.longueur = 0;
        this.largeur = 0;
        this.nom = "rectangle";
    }

    public Rectangle(float longueur, float largeur) {
        this.longueur = longueur;
        this.largeur = largeur;
        this.nom = "rectangle";
    }

    public float Air(){
        return  this.longueur * this.largeur;
    }

    public void Display(){
        System.out.println("La longueur : " + this.longueur + ", La largeur : " + this.largeur + ", L'aire :" + this.Air() + ", " + this.nom);
    }
}

class Care extends Rectangle{
    float a ;
    String nom;

    public Care(){
        super();
        this.nom = "Care";
    }

    public Care(float a){
        super(a,a);
        this.nom = "Care";
    }
    @Override
    public void Display(){
        System.out.println("La longueur : " + this.longueur + ", La largeur : " + this.largeur + ", L'aire :" + this.Air() + ", " + this.nom);
    }

}


