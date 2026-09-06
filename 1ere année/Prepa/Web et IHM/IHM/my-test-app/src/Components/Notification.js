function Notification({ addedProducts }) {
  return addedProducts > 0 && <div className="noti">{addedProducts}</div>;
}

export default Notification;
