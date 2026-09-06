import java.util.ArrayList;
import java.util.List;

public class GestionContacts {
    List<Contact> contacts ;

    public GestionContacts(){
        contacts = new ArrayList<>();
    }

    public void  ajouteContact(String name , String number){
        contacts.add(new Contact(name ,number));
    }

    public void supprimeContact(String name){
        int cp = 0;
        for(Contact c : contacts){
            if((c.name).equals(name)){
                cp++;
                contacts.remove(c);
                System.out.println("Le contact " + c.name + " est supprime");
                return;
            }
        }
        if(cp == 0){
            System.out.println(name + " n'existe pas");
        }
    }

    public void rechercheContact(String name){
        int cp = 0;
        for(Contact c : contacts){
            if((c.name).equals(name)){
                cp++;
                System.out.println("Le contact " + c.name + " a le numero : " + c.phoneNumber);
                return;
            }
        }
        if(cp == 0){
            System.out.println(name + " n'existe pas");
        }
    }


    public void afficheList(){
        for(Contact c : contacts){
            System.out.println(c.name + " : " + c.phoneNumber);
        }
    }


    public static void main(String[] args) {
        GestionContacts c = new GestionContacts();
        c.ajouteContact("abdou", "0011");
        c.ajouteContact("Moha", "5234");
        c.ajouteContact("Mimo", "4523");
        c.ajouteContact("Toto", "2233");

        c.afficheList();

        c.rechercheContact("abdou");

        c.supprimeContact("Mimo");

        c.afficheList();
    }
    
}