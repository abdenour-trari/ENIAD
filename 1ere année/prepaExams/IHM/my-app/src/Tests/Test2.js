export default function UncontrolledForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    for (let [name, value] of f.entries()) {
      if (value === "3gon") {
        console.log(`${name} : ${value} is MRiiiiiiiiiiiiiiiiiid`);
      }
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <label>First Name:</label>
      <input type="text" name="firstName" />
      <label>Last Name:</label>
      <input type="text" name="lastName" />
      <label>Email:</label>
      <input type="email" name="email" />
      <button type="submit">Submit</button>
    </form>
  );
}
