public class Batiment {
    String adresse ;

    public Batiment() {
        this.adresse = "";
    }
    public Batiment(String adresse) {
        this.adresse = adresse;
    }

    public String getAdresse() {
            return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public void Display(){
        System.out.println(
                "L'adresse du batiment : " + this.adresse
        );
    }
}

class Maison extends Batiment{
    int NbPieces;

    public Maison() {
        NbPieces = 0;
    }

    public Maison(String adresse, int nbPieces) {
        super(adresse);
        NbPieces = nbPieces;
    }

    public int getNbPieces() {
        return NbPieces;
    }

    public void setNbPieces(int nbPieces) {
        NbPieces = nbPieces;
    }

    @Override
    public void Display(){
        System.out.println(
                "L'adresse du maison : " + this.adresse
                + "Nombre de piece est : " + this.NbPieces
        );
    }
}
