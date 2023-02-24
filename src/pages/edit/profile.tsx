import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";

type ProfileType = {
  user: {
    id: string;
    username: string;
    createdAt: string;
    updatedAt: string;
  };
};

const EditProfile: NextPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileType | undefined>(() => {
    return queryClient.getQueryData(["edit", "profile"]);
  });

  const { data, isLoading, isError } = useQuery<ProfileType, any>({
    queryKey: ["edit", "profile"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/v1/profile", { withCredentials: true });
      const data = response.data as ProfileType;
      return data;
    },
    onSuccess: (data) => {
      console.log(data);
      setProfile(data);
      if (!data?.user.username) {
        // setHasUsername(false);
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

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({
        user: {
          ...profile.user,
          username: e.target.value,
        },
      });
    }
    // const user = queryClient.getQueryData(["edit", "profile"]);

    // if (profile) {
    //   queryClient.setQueryData(["edit", "profile"], {
    //     user: {
    //       ...profile.user,
    //       username: e.target.value,
    //     },
    //   });
    // }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isError) {
    return (
      <>
        <input
          type="text"
          placeholder="name"
          value={profile?.user.username}
          onChange={(e) => {
            onChangeHandler(e);
          }}
        />
        <button
          onClick={() => {
            console.log(profile);
          }}
        >
          save
        </button>
      </>
    );
  }
  return null;
};

export default EditProfile;
