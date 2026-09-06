import java.util.Scanner;

public class Complexe {

    private double paRe,paIm ;

    public Complexe(){
        this.paIm = 0 ;
        this.paRe = 0 ;
    }

    public Complexe(double paRe , double paIm){
        this.paRe = paRe ;
        this.paIm = paIm ;
    }

    public double getPaRe() {
        return paRe;
    }

    public void setPaRe(double paRe) {
        this.paRe = paRe;
    }

    public double getPaIm() {
        return paIm;
    }

    public void setPaIm(double paIm) {
        this.paIm = paIm;
    }

    public Complexe Plus(Complexe complexe){

        double sommeRe = complexe.paRe + this.paRe ;
        double sommeIm = complexe.paIm + this.paIm ;
        Complexe c1 = new Complexe(sommeRe,sommeIm);
        System.out.println("La somme de " + this.afficher() + " et " + complexe.afficher() + " est : ");

        return c1 ;
    }

    public Complexe Moins(Complexe complexe){

        double differenceRe = this.paRe - complexe.paRe ;
        double differenceIm = this.paIm - complexe.paIm ;
        Complexe c1 = new Complexe(differenceRe,differenceIm);
        System.out.println("La différence de " + this.afficher() + " et " + complexe.afficher() + " est : ");
        return c1 ;
    }

    public String afficher(){
        return paIm>=0? paRe + " + " + paIm + "i" :  paRe + " - " + paIm*(-1) + "i";
    }
}


class Main2{
    public static void main(String [] args){

        Scanner sc = new Scanner(System.in);

        // Complexe N1 :
        System.out.println("Complexe 1 : ");
        System.out.println("Donner la partie reel : ");
        double partieR = sc.nextDouble();
        System.out.println("Donner la partie imaginaire : ");
        double partieI = sc.nextDouble();

        Complexe complexe = new Complexe(partieR,partieI);
        System.out.println(complexe.afficher());

        // Complexe N2 :
        System.out.println("Complexe 2 : ");
        System.out.println("Donner la partie reel : ");
        double partieR2 = sc.nextDouble();
        System.out.println("Donner la partie imaginaire : ");
        double partieI2 = sc.nextDouble();

        Complexe complexe2 = new Complexe(partieR2,partieI2);
        System.out.println(complexe2.afficher());


        System.out.println(complexe.Plus(complexe2).afficher());

        System.out.println(complexe.Moins(complexe2).afficher());

    }
}
