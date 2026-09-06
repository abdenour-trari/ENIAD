public abstract class Vehicule {
    private static int matriculation = 0 ;
    private int annee ;
    private double price;
    private int mat = matriculation;
    public Vehicule() {
        this.annee = 0;
        this.price = 0;
        matriculation++;
    }
    public Vehicule(int annee, double price) {
        this.annee = annee;
        this.price = price;
        matriculation++;
    }

    public static int getMatriculation() {
        return matriculation;
    }

    public static void setMatriculation(int matriculation) {
        Vehicule.matriculation = matriculation;
    }

    public int getAnnee() {
        return annee;
    }

    public void setAnnee(int annee) {
        this.annee = annee;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public abstract void demarer();
    public abstract void accelerer();

    @Override
    public String toString() {
        return "Vehicule{" +
                "annee=" + annee +
                ", price=" + price +
                ", Matricule =" + matriculation +
                '}';
    }

}

class Voiture extends Vehicule{

    int mat = getMatriculation() ;
    public Voiture() {

    }

    public Voiture(int annee, double price) {
        super(annee, price);
    }

    @Override
    public void demarer() {
        System.out.println("Voiture demare");
    }

    @Override
    public void accelerer() {
        System.out.println("Voiture accelère");

    }
    @Override
    public String toString() {
        return "Vehicule{" +
                "annee=" + super.getAnnee() +
                ", price=" + super.getPrice() +
                ", Matricule =" + mat +
                '}';
    }

}

class Camion extends Vehicule{
    int mat = getMatriculation() ;
    public Camion() {

    }

    public Camion(int annee, double price) {
        super(annee, price);
    }

    @Override
    public void demarer() {
        System.out.println("Camion demare");
    }

    @Override
    public void accelerer() {
        System.out.println("Camion accelere");

    }
    @Override
    public String toString() {
        return "Vehicule{" +
                "annee=" + super.getAnnee() +
                ", price=" + super.getPrice() +
                ", Matricule =" + mat +
                '}';
    }

}
