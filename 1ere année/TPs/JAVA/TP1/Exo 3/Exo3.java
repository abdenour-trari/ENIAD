public class Exo3{
        static int fact(int a){
        int f = 1 ; 
        int i = a ;
        if(a == 1 || a ==0) return 1 ;
        else{
            while(i > 1){
                f = f * i ;
                i-- ; 
            }
        return f ;
        }
    }

	public static void main(String [] args){
        int a = 5 ; 
        System.out.println(fact(a));  

	}
}