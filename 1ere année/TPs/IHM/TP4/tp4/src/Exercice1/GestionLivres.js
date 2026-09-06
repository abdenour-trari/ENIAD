import "./GestionLivres.css";

const GestionLivres = ({ data, searchedId }) => {
  return (
    <ul>
      {data.map((book) => (
        <li
          key={book.id}
          style={{
            backgroundColor:
              book.id === searchedId ? "lightgreen" : "transparent",
            width: "max-content",
          }}
        >
          {book.id}, {book.titre}, {book.prix}
        </li>
      ))}
    </ul>
  );
};

export default GestionLivres;
