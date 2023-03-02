import Link from "next/link";

const Navbar = () => {
  return (
    <>
      <div>
        <Link href="/search">Search</Link>

        <Link href="/profile">Profile</Link>
      </div>
    </>
  );
};

export default Navbar;
