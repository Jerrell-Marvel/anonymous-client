import { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import Link from "next/link";

type ProfileType = {
  user: {
    id: string;
    username: string;
    createdAt: string;
    updatedAt: string;
  };
};

const Profile = () => {
  const [hasUsername, setHasUsername] = useState(true);
  const router = useRouter();

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<ProfileType, any>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/v1/profile", { withCredentials: true });
      const data = response.data as ProfileType;
      return data;
    },
    onSuccess: (profile) => {
      console.log(profile);
      if (!profile?.user.username) {
        setHasUsername(false);
      }
    },

    onError: (err) => {
      console.log(err?.request?.status);
      if (err?.request?.status === 401) {
        router.push("/login");
      }
      console.log(err);
    },
    retry: false,
  });

  if (isLoading) {
    return <div>LOADING ....</div>;
  }

  if (!hasUsername) {
    return (
      <div>
        <span>To generate your link please update your profile</span>
        <Link href="/edit/profile">edit profile</Link>
      </div>
    );
  }

  if (!isError) {
    return (
      <>
        <p>{profile?.user.username}</p>
        <p>{profile?.user.id}</p>
        <Link href="/edit/profile">edit profile</Link>
        <p>Share your link</p>
        <p>{"https://domain/" + profile?.user.username}</p>
      </>
    );
  }
};

export default Profile;
