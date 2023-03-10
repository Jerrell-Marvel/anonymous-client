import { NextPage } from "next";
import Image from "next/image";

const Login: NextPage = () => {
  return (
    <>
      <div className="p-6 min-h-screen flex flex-col items-center justify-center text-center gap-8">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold">Anonymous</h1>

        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sunt, beatae quas cupiditate dignissimos assumenda velit nisi nesciunt distinctio consequuntur odit.</p>

        <a href="http://localhost:5000/auth/google">
          <div className="flex bg-white px-6 py-3 rounded-full gap-4">
            <Image
              src="/icon_google.webp"
              width={24}
              height={24}
              alt="google-logo"
            />
            <span>Continue With Google</span>
          </div>
        </a>
      </div>
    </>
  );
};

export default Login;
