public class Point {
    private float ab , or ;

    public float getAb() {
        return ab;
    }

    public void setAb(float ab) {
        this.ab = ab;
    }

    public float getOr() {
        return or;
    }

    public void setOr(float or) {
        this.or = or;
    }

    public Point() {
        this.ab = 0;
        this.or = 0 ;
    }

    public Point(float ab, float or) {
        this.ab = ab;
        this.or = or;
    }

    public float Norme(){
        return (float) Math.sqrt((this.ab*this.ab) + (this.or*this.or) );
    }

    public static  void main(String [] args){
        Point p1 = new Point(1 , 2);
        System.out.println("La norme de P(" + p1.ab + ", " + p1.or + ") = " + p1.Norme());
    }

}
