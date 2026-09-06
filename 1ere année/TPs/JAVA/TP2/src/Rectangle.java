import java.util.Scanner;

public class Rectangle {
    private float longueur,largeur ;

    public float getLongueur() {
        return longueur;
    }

    public void setLongueur(float longueur) {
        this.longueur = longueur;
    }

    public float getLargeur() {
        return largeur;
    }

    public void setLargeur(float largeur) {
        this.largeur = largeur;
    }

    public Rectangle(float longueur , float largeur){
        this.largeur = largeur ;
        this.longueur = longueur ;
    }

    public float Perimetre(){
        return (this.largeur + this.longueur) * 2 ;
    }

    public float Aire(){
        return (this.longueur * this.largeur);
    }

    public boolean estCaree(){
        return this.largeur == this.longueur;
    }

    public String afficherrectange(){
        String estCaree ;
        estCaree = this.estCaree()? "il s'agit d'un carré" : "il ne s'agit pas d'un carée";

        return "Longueur : [ " + this.longueur + " ] - Largeur : [ " + this.largeur + " ] - Périmètre : [ " + this.Perimetre() +
                " ] - " + estCaree ;

    }

}

class Main3{
    public static void main(String [] args){

        Scanner sc = new Scanner(System.in);


        System.out.println("Donner la Longueur : ");
        float Longueur = sc.nextFloat();
        System.out.println("Donner la largeur : ");
        float Largeur = sc.nextFloat();

        Rectangle r1 = new Rectangle(Longueur , Largeur);

        System.out.println("La surface du rectangle est : " + r1.Aire());
        System.out.println("Le périmètre du rectangle est : " + r1.Perimetre());

        System.out.println(r1.afficherrectange());


    }
}

