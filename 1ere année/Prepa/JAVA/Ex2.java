import java.util.HashSet;
import java.util.Set;

class Ex2 {
    public static void main(String[] args) {
        GestionMembresClub me = new GestionMembresClub();
        me.addMember("Moha");
        me.addMember("Moha"); // Tentative d'ajout d'un membre déjà existant
        me.addMember("Abdou");
        me.addMember("Luffy");

        me.affiche();
    }
}

class Member {
    private String name;

    public Member(String name) {
        this.name = name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Member member = (Member) obj;
        return name.equals(member.name);
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }
}

class GestionMembresClub {
    Set<Member> member;

    public GestionMembresClub() {
        member = new HashSet<>();
    }

    public void addMember(String name) {
        member.add(new Member(name));
    }

    public void affiche() {
        for (Member m : member) {
            System.out.println(m.getName());
        }
    }
}