import java.util.Scanner ;

public class Main{

    public static void main(String [] args){
        Scanner sc = new Scanner(System.in);

        System.out.print("Veuillez donner votre chaine : ");
        String chaine =sc.nextLine();


        System.out.print("Veuillez donner l'indice du caractere à remplacer : ");
        int index = sc.nextInt();

        sc.nextLine();

        System.out.print("Veuillez donner le caractere : ");
        String ch = sc.nextLine();


        chaine = chaine.substring(0,index-1) + ch;

        System.out.println(chaine);
    }
}