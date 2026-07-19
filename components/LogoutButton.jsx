export default function LogoutButton({ className = '' }) {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className={className}>Sair da conta</button>
    </form>
  );
}
