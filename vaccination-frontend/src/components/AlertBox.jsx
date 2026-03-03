export default function AlertBox({ message, type = "warning" }) {
  return (
    <div className={`alert-box ${type}`}>
      {message}
    </div>
  );
}