public  class Main {

    public static void main(String[] args) {
        /*
        Rectangle c1 = new Care(3f);
        c1.Display();

        Care c2 = new Care();
        c2.Display();

        Batiment m1 = new Batiment("Rue Saffae 2 , ANDALOUS");
        m1.Display();
        */

        /*
        Emplye o = new Ouvrier("Abdou","Trari","32131","10/10/2004",8);
        Emplye c = new Cadre("Abdou","Trari","32131","10/10/2004",3);
        Emplye p = new Patron("Abdou","Trari","32131","10/10/2004",1000000,20);

        o.Display();
        c.Display();
        p.Display();
         */

        Vehicule [] v = new Vehicule[]{new Voiture(2024,300000) , new Camion(2010,430000)};
        for(int i=0 ; i<v.length ; i++){
            System.out.println(v[i].toString());
             
            v[i].accelerer();
        }

    }
}