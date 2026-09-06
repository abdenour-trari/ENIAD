public abstract class Emplye {
    String nom , prenom , matricule ,dateNaissance ;

    public Emplye(String nom, String prenom, String matricule, String dateNaissance) {
        this.nom = nom;
        this.prenom = prenom;
        this.matricule = matricule;
        this.dateNaissance = dateNaissance;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public String getDateNaissance() {
        return dateNaissance;
    }

    public void setDateNaissance(String dateNaissance) {
        this.dateNaissance = dateNaissance;
    }


    public void Display() {
        System.out.println("Emplye{" +
                "nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", matricule='" + matricule + '\'' +
                ", dateNaissance='" + dateNaissance + '\'' +
                '}'
        );
    }

    public abstract double GetSalaire();
}

class Ouvrier extends Emplye{

    int anctiente;

    public Ouvrier(String nom, String prenom, String matricule, String dateNaissance, int anctiente) {
        super(nom, prenom, matricule, dateNaissance);
        this.anctiente = anctiente;
    }


    @Override
    public void Display() {
        System.out.println("Emplye{" +
                "nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", matricule='" + matricule + '\'' +
                ", dateNaissance='" + dateNaissance + '\'' +
                ", Anciennté ='" + anctiente + '\'' +
                ", Salaire='" + GetSalaire() + '\'' +
                '}'
        );
    }

    public double GetSalaire(){
        return (2500 * anctiente * 100) ;
    }
}

class Cadre extends Emplye{

    int indice;

    public Cadre(String nom, String prenom, String matricule, String dateNaissance, int indice) {
        super(nom, prenom, matricule, dateNaissance);
        this.indice = indice;
    }


    @Override
    public void Display() {
        System.out.println("Emplye{" +
                "nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", matricule='" + matricule + '\'' +
                ", dateNaissance='" + dateNaissance + '\'' +
                ", Indice ='" + indice + '\'' +
                ", Salaire='" + GetSalaire() + '\'' +
                '}'
        );
    }

    public double GetSalaire(){
        switch (indice) {
            case 1 : return 13000;
            case 2 : return 15000;
            case 3 : return 17000;
            case 4 : return 20000;
        }
        return 0;
    }
}

class Patron extends Emplye{

    double CA;
    double P;

    public Patron(String nom, String prenom, String matricule, String dateNaissance, double CA , double P) {
        super(nom, prenom, matricule, dateNaissance);
        this.CA = CA;
        this.P = P;
    }


    @Override
    public void Display() {
        System.out.println("Emplye{" +
                "nom='" + nom + '\'' +
                ", prenom='" + prenom + '\'' +
                ", matricule='" + matricule + '\'' +
                ", dateNaissance='" + dateNaissance + '\'' +
                ", CA ='" + CA + '\'' +
                ", Salaire='" + GetSalaire() + '\'' +
                '}'
        );
    }

    public double GetSalaire(){
        return CA * (P/100);
    }
}
