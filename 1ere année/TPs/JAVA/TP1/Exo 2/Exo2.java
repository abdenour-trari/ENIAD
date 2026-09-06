public class Exo2{
    static double Maximum(double a , double b , double c){
        if(a > b && a > c) return a;
        else if(b > a && b > c) return b;
        else return c; 
    }
    public static void main(String [] args){
        double x=7 ,y=20 ,z=56 ;
        System.out.println(Maximum(x , y ,z));
    }
}