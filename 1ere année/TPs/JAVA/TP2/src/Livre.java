import java.util.Scanner;

public class Livre {

    private String titre, nomAuteur ;
    private double prix ;

    public Livre(String titre , String nomAuteur , double prix){

        this.titre = titre;
        this.nomAuteur = nomAuteur;
        this.prix = prix ;
    }

    String getTitre(){
        return this.titre;
    }

    String getNomAuteur(){
        return this.nomAuteur;
    }

    double getPrix(){
        return this.prix;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public void setNomAuteur(String nomAuteur) {
        this.nomAuteur = nomAuteur;
    }

    public void setPrix(double prix) {
        this.prix = prix;
    }

    public String afficher() {
        return "Livre : " + this.titre +
                "\nNom de l'auteur : " + this.nomAuteur +
                "\nPrix : " + this.prix ;
    }
}

class Main1 {
    public static void main(String [] args){

        Scanner sc = new Scanner(System.in);
        System.out.println("Donner le titre : ");
        String titre = sc.nextLine();
        System.out.println("Donner le nom de l'auteur : ");
        String nomAuteur = sc.nextLine();
        System.out.println("Donner le prix du livre : ");
        double prix = sc.nextDouble();


        Livre l1 =  new Livre(titre, nomAuteur ,prix);
        System.out.println(l1.afficher());
    }
}
