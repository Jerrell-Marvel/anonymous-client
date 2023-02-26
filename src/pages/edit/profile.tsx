import axios, { AxiosError } from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

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
    return queryClient.getQueryData<ProfileType>(["edit", "profile"]);
  });

  const [getProfileErrMsg, setGetProfileErrMsg] = useState("");
  const [updateProfileErrMsg, setUpdateProfileErrMsg] = useState("");

  const { data, isLoading, isError } = useQuery<ProfileType, any>({
    queryKey: ["edit", "profile"],
    queryFn: async () => {
      const response = await axios.get<ProfileType>("http://localhost:5000/api/v1/profile", { withCredentials: true });
      const data = response.data;
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
      } else {
        setGetProfileErrMsg("Something went wrong please try again later");
      }
      console.log(err);
    },
    retry: false,
  });

  const { data: updateResponse, mutate: updateProfile } = useMutation<any, AxiosError>({
    mutationFn: async () => {
      const response = await axios.post<{ success: boolean }>(
        "http://localhost:5000/api/v1/profile",
        {
          username: profile?.user.username,
        },
        { withCredentials: true }
      );

      return response.data;
    },

    onSuccess: () => {
      router.push("/profile");
    },

    onError: (err) => {
      // Do something with this error...
      if (err.request.status === 400) {
        setUpdateProfileErrMsg("Name is already exist");
      } else {
        setUpdateProfileErrMsg("Something went wrong please try again later");
      }
    },
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
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (getProfileErrMsg) {
    return <div>{getProfileErrMsg}</div>;
  }

  if (!isError) {
    return (
      <>
        <div>
          <div>
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
                updateProfile();
                console.log(profile);
              }}
            >
              save
            </button>
          </div>

          <h1>{updateProfileErrMsg}</h1>
        </div>
      </>
    );
  }
  return null;
};

export default EditProfile;
